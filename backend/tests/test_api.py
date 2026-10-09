import unittest
import sys
import os
import json
from fastapi.testclient import TestClient

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.rooms import room_manager

class TestFastAPIRestAndWebSocket(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        room_manager.rooms.clear()

    def test_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "online")
        self.assertEqual(data["version"], "1.0.0")
        self.assertEqual(data["active_rooms"], 0)
        self.assertIsInstance(data["timestamp"], int)

    def test_create_room_valid(self):
        for size in [3, 4, 5]:
            res = self.client.post("/api/rooms", json={"board_size": size, "creator_name": f"Pilot_{size}"})
            self.assertEqual(res.status_code, 201)
            data = res.json()
            self.assertEqual(data["board_size"], size)
            self.assertEqual(data["symbol"], "X")
            self.assertTrue(data["room_code"])
            self.assertTrue(data["player_id"].startswith("usr_"))
            self.assertIn(data["room_code"], data["ws_url"])

    def test_create_room_invalid_size(self):
        res = self.client.post("/api/rooms", json={"board_size": 6, "creator_name": "Pilot_6"})
        self.assertEqual(res.status_code, 422)

    def test_join_room_flow(self):
        # Create room
        res = self.client.post("/api/rooms", json={"board_size": 3, "creator_name": "Host"})
        room_data = res.json()
        code = room_data["room_code"]

        # Join room as Player O
        join_res = self.client.post(f"/api/rooms/{code}/join", json={"player_name": "Challenger"})
        self.assertEqual(join_res.status_code, 200)
        join_data = join_res.json()
        self.assertEqual(join_data["symbol"], "O")
        self.assertEqual(join_data["board_size"], 3)
        self.assertTrue(join_data["player_id"].startswith("usr_"))

        # Third player cannot join
        third_res = self.client.post(f"/api/rooms/{code}/join", json={"player_name": "Intruder"})
        self.assertEqual(third_res.status_code, 409)

    def test_join_nonexistent_room(self):
        res = self.client.post("/api/rooms/NONEXIST-999/join", json={"player_name": "Challenger"})
        self.assertEqual(res.status_code, 404)

    def test_websocket_missing_or_invalid_player(self):
        res = self.client.post("/api/rooms", json={"board_size": 3, "creator_name": "Host"})
        code = res.json()["room_code"]

        # Missing player_id
        with self.client.websocket_connect(f"/ws/{code}") as ws:
            msg = ws.receive_json()
            self.assertEqual(msg["type"], "ERROR")
            self.assertEqual(msg["code"], "MISSING_PLAYER_ID")

        # Unauthorized player_id
        with self.client.websocket_connect(f"/ws/{code}?player_id=usr_unknown") as ws:
            msg = ws.receive_json()
            self.assertEqual(msg["type"], "ERROR")
            self.assertEqual(msg["code"], "UNAUTHORIZED")

        # Nonexistent room
        with self.client.websocket_connect("/ws/FAKE-000?player_id=usr_123") as ws:
            msg = ws.receive_json()
            self.assertEqual(msg["type"], "ERROR")
            self.assertEqual(msg["code"], "ROOM_NOT_FOUND")

    def test_websocket_full_match_and_rematch(self):
        # 1. Create room
        r_create = self.client.post("/api/rooms", json={"board_size": 3, "creator_name": "Alice"})
        room_data = r_create.json()
        code = room_data["room_code"]
        x_id = room_data["player_id"]

        # 2. Join room
        r_join = self.client.post(f"/api/rooms/{code}/join", json={"player_name": "Bob"})
        o_id = r_join.json()["player_id"]

        # 3. Connect both WebSockets
        with self.client.websocket_connect(f"/ws/{code}?player_id={x_id}") as ws_x:
            # Receive initial state for X
            init_x = ws_x.receive_json()
            self.assertEqual(init_x["type"], "ROOM_STATE")
            self.assertEqual(init_x["room_code"], code)

            with self.client.websocket_connect(f"/ws/{code}?player_id={o_id}") as ws_o:
                # O connects -> X gets updated state, O gets state
                state_x_after_o = ws_x.receive_json()
                state_o = ws_o.receive_json()
                self.assertEqual(state_o["type"], "ROOM_STATE")
                self.assertEqual(state_o["status"], "PLAYING")
                self.assertEqual(state_o["current_turn"], "X")

                # Test Ping/Pong
                ws_x.send_text(json.dumps({"type": "PING"}))
                pong = ws_x.receive_json()
                self.assertEqual(pong["type"], "PONG")

                # Player O tries to move when it's X's turn
                ws_o.send_text(json.dumps({"type": "MOVE", "cell_index": 0}))
                err = ws_o.receive_json()
                self.assertEqual(err["type"], "ERROR")
                self.assertEqual(err["code"], "INVALID_MOVE")

                # Player X moves at 0 (top-left)
                ws_x.send_text(json.dumps({"type": "MOVE", "cell_index": 0}))
                s_x = ws_x.receive_json()
                s_o = ws_o.receive_json()
                self.assertEqual(s_x["board"][0], "X")
                self.assertEqual(s_x["current_turn"], "O")

                # Player O moves at 3 (mid-left)
                ws_o.send_text(json.dumps({"type": "MOVE", "cell_index": 3}))
                s_x = ws_x.receive_json()
                s_o = ws_o.receive_json()
                self.assertEqual(s_x["board"][3], "O")
                self.assertEqual(s_x["current_turn"], "X")

                # Player X moves at 1 (top-center)
                ws_x.send_text(json.dumps({"type": "MOVE", "cell_index": 1}))
                ws_x.receive_json()
                ws_o.receive_json()

                # Player O moves at 4 (center)
                ws_o.send_text(json.dumps({"type": "MOVE", "cell_index": 4}))
                ws_x.receive_json()
                ws_o.receive_json()

                # Player X moves at 2 (top-right) -> Winning move!
                ws_x.send_text(json.dumps({"type": "MOVE", "cell_index": 2}))
                win_state_x = ws_x.receive_json()
                win_state_o = ws_o.receive_json()
                self.assertEqual(win_state_x["status"], "WON")
                self.assertEqual(win_state_x["winner"], "X")
                self.assertEqual(win_state_x["winning_line"], [0, 1, 2])
                self.assertEqual(win_state_x["players"]["X"]["score"], 1)

                # Both also receive MATCH_OVER
                over_x = ws_x.receive_json()
                over_o = ws_o.receive_json()
                self.assertEqual(over_x["type"], "MATCH_OVER")
                self.assertEqual(over_x["winner"], "X")

                # Rematch Request from X
                ws_x.send_text(json.dumps({"type": "REMATCH_REQUEST"}))
                rematch_pending_x = ws_x.receive_json()
                rematch_pending_o = ws_o.receive_json()
                self.assertEqual(rematch_pending_x["status"], "WON") # Still waiting for O
                self.assertIn(x_id, rematch_pending_x["rematch_requested_by"])

                # Rematch Request from O -> triggers reset!
                ws_o.send_text(json.dumps({"type": "REMATCH_REQUEST"}))
                reset_x = ws_x.receive_json()
                reset_o = ws_o.receive_json()
                self.assertEqual(reset_x["status"], "PLAYING")
                self.assertEqual(reset_x["current_turn"], "X")
                self.assertIsNone(reset_x["winner"])
                self.assertIsNone(reset_x["board"][0])

    def test_websocket_resign(self):
        r_create = self.client.post("/api/rooms", json={"board_size": 3, "creator_name": "Alice"})
        code = r_create.json()["room_code"]
        x_id = r_create.json()["player_id"]
        r_join = self.client.post(f"/api/rooms/{code}/join", json={"player_name": "Bob"})
        o_id = r_join.json()["player_id"]

        with self.client.websocket_connect(f"/ws/{code}?player_id={x_id}") as ws_x:
            ws_x.receive_json()
            with self.client.websocket_connect(f"/ws/{code}?player_id={o_id}") as ws_o:
                ws_x.receive_json()
                ws_o.receive_json()

                # Player X resigns
                ws_x.send_text(json.dumps({"type": "RESIGN"}))
                resign_state_x = ws_x.receive_json()
                resign_state_o = ws_o.receive_json()
                self.assertEqual(resign_state_x["status"], "WON")
                self.assertEqual(resign_state_x["winner"], "O")
                self.assertEqual(resign_state_x["players"]["O"]["score"], 1)

if __name__ == "__main__":
    unittest.main()
