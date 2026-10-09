import unittest
import sys
import os
import time

# Ensure backend root is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.rooms import Room, RoomManager, generate_room_code

class TestRoomLifecycle(unittest.TestCase):
    def test_room_code_generation(self):
        code1 = generate_room_code()
        code2 = generate_room_code()
        self.assertNotEqual(code1, code2)
        self.assertIn("-", code1)
        self.assertEqual(len(code1), 7)  # e.g. ABC-123

    def test_room_creation_and_joining(self):
        room = Room("CYBER-101", 3, "usr_x", "Pilot_X")
        self.assertEqual(room.room_code, "CYBER-101")
        self.assertEqual(room.board_size, 3)
        self.assertEqual(room.status, "WAITING")
        self.assertEqual(room.get_symbol_by_player_id("usr_x"), "X")

        # Join player O
        success = room.add_player_o("usr_o", "Rival_O")
        self.assertTrue(success)
        self.assertEqual(room.status, "PLAYING")
        self.assertEqual(room.get_symbol_by_player_id("usr_o"), "O")

        # Third player cannot join
        self.assertFalse(room.add_player_o("usr_intruder", "Intruder"))

        # Rejoining with existing O player id succeeds
        self.assertTrue(room.add_player_o("usr_o", "Rival_O"))

    def test_moves_turn_alternation_and_win(self):
        room = Room("TEST-01", 3, "usr_x", "Pilot_X")
        room.add_player_o("usr_o", "Rival_O")

        # X moves at 0
        ok, err = room.apply_move("usr_x", 0)
        self.assertTrue(ok)
        self.assertEqual(room.current_turn, "O")

        # X cannot move again immediately
        ok, err = room.apply_move("usr_x", 1)
        self.assertFalse(ok)
        self.assertIn("Not your turn", err)

        # O cannot move on occupied cell 0
        ok, err = room.apply_move("usr_o", 0)
        self.assertFalse(ok)

        # O moves at 3
        ok, _ = room.apply_move("usr_o", 3)
        self.assertTrue(ok)

        # X moves at 1
        ok, _ = room.apply_move("usr_x", 1)
        self.assertTrue(ok)

        # O moves at 4
        ok, _ = room.apply_move("usr_o", 4)
        self.assertTrue(ok)

        # X moves at 2 (Wins top row [0, 1, 2])
        ok, _ = room.apply_move("usr_x", 2)
        self.assertTrue(ok)
        self.assertEqual(room.status, "WON")
        self.assertEqual(room.winner, "X")
        self.assertEqual(room.winning_line, [0, 1, 2])
        self.assertEqual(room.players["X"]["score"], 1)
        self.assertEqual(room.players["O"]["score"], 0)

        # No more moves allowed when WON
        ok, err = room.apply_move("usr_o", 5)
        self.assertFalse(ok)

    def test_resignation(self):
        room = Room("TEST-02", 3, "usr_x", "Pilot_X")
        room.add_player_o("usr_o", "Rival_O")

        # Player X resigns
        ok, err = room.apply_resign("usr_x")
        self.assertTrue(ok)
        self.assertEqual(room.status, "WON")
        self.assertEqual(room.winner, "O")
        self.assertEqual(room.players["O"]["score"], 1)

    def test_rematch_handshake(self):
        room = Room("TEST-03", 3, "usr_x", "Pilot_X")
        room.add_player_o("usr_o", "Rival_O")

        # Player X resigns so game is ended
        room.apply_resign("usr_x")
        self.assertEqual(room.status, "WON")

        # Player X requests rematch
        ok, reset_done = room.request_rematch("usr_x")
        self.assertTrue(ok)
        self.assertFalse(reset_done)  # Waiting for player O
        self.assertEqual(room.status, "WON")
        self.assertIn("usr_x", room.rematch_requests)

        # Player O requests rematch
        ok, reset_done = room.request_rematch("usr_o")
        self.assertTrue(ok)
        self.assertTrue(reset_done)  # Both agreed, reset triggered!
        self.assertEqual(room.status, "PLAYING")
        self.assertEqual(room.current_turn, "X")
        self.assertIsNone(room.winner)
        self.assertEqual(len(room.rematch_requests), 0)

    def test_disconnect_and_reconnect(self):
        room = Room("TEST-04", 3, "usr_x", "Pilot_X")
        room.add_player_o("usr_o", "Rival_O")
        room.players["X"]["connected"] = True

        sym = room.disconnect_player("usr_x")
        self.assertEqual(sym, "X")
        self.assertFalse(room.players["X"]["connected"])

    def test_room_manager_ttl_and_capacity(self):
        mgr = RoomManager(room_ttl_seconds=1, max_rooms=2)
        r1, id1 = mgr.create_room(3, "P1")
        r2, id2 = mgr.create_room(3, "P2")

        # Exceeding capacity when active raises error
        with self.assertRaises(RuntimeError):
            mgr.create_room(3, "P3")

        # Wait for TTL expiry
        time.sleep(1.1)
        # Creating a room now purges expired rooms
        r3, id3 = mgr.create_room(3, "P3")
        self.assertIn(r3.room_code, mgr.rooms)
        self.assertNotIn(r1.room_code, mgr.rooms)

if __name__ == "__main__":
    unittest.main()
