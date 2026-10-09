"""
Simulates two independent clients interacting over REST and WebSockets.
Session 1: Alice (Desktop Player X)
Session 2: Bob (Mobile Player O)
"""
import sys
import os
import json

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

def simulate_two_player_duel():
    print("--- Starting Two Independent Client Multiplayer Duel Simulation ---")
    client = TestClient(app)

    # 1. Client 1 (Alice) creates a 3x3 Arena room
    print("[Session 1: Alice] Creating room via POST /api/rooms...")
    r1 = client.post("/api/rooms", json={"board_size": 3, "creator_name": "Alice_Cyber"})
    assert r1.status_code == 201, f"Failed to create room: {r1.text}"
    alice_data = r1.json()
    room_code = alice_data["room_code"]
    alice_id = alice_data["player_id"]
    print(f"[Session 1: Alice] Room created: {room_code}, Symbol: {alice_data['symbol']}, ID: {alice_id}")

    # 2. Client 2 (Bob) joins the room with the code
    print(f"[Session 2: Bob] Joining room {room_code} via POST /api/rooms/{room_code}/join...")
    r2 = client.post(f"/api/rooms/{room_code}/join", json={"player_name": "Bob_Rival"})
    assert r2.status_code == 200, f"Failed to join room: {r2.text}"
    bob_data = r2.json()
    bob_id = bob_data["player_id"]
    print(f"[Session 2: Bob] Joined room: {room_code}, Symbol: {bob_data['symbol']}, ID: {bob_id}")

    # 3. Both clients establish WebSocket connections
    print("[Sessions 1 & 2] Establishing independent WebSockets...")
    with client.websocket_connect(f"/ws/{room_code}?player_id={alice_id}") as ws_alice:
        alice_initial = ws_alice.receive_json()
        assert alice_initial["type"] == "ROOM_STATE"

        with client.websocket_connect(f"/ws/{room_code}?player_id={bob_id}") as ws_bob:
            # Both receive updated active state
            state_alice = ws_alice.receive_json()
            state_bob = ws_bob.receive_json()
            assert state_alice["status"] == "PLAYING"
            assert state_bob["status"] == "PLAYING"
            print("[OK] Match is ACTIVE. Players synchronized on initial board.")

            # Turn 1: Alice places X at 4 (Center)
            print("[Turn 1] Alice plays cell 4...")
            ws_alice.send_text(json.dumps({"type": "MOVE", "cell_index": 4}))
            s1_alice = ws_alice.receive_json()
            s1_bob = ws_bob.receive_json()
            assert s1_alice["board"][4] == "X"
            assert s1_bob["board"][4] == "X"
            assert s1_alice["current_turn"] == "O"
            assert s1_bob["current_turn"] == "O"

            # Anti-Cheat: Alice attempts illegal move out of turn
            print("[Anti-Cheat Test] Alice attempts to move again out of turn...")
            ws_alice.send_text(json.dumps({"type": "MOVE", "cell_index": 0}))
            err_alice = ws_alice.receive_json()
            assert err_alice["type"] == "ERROR"
            assert err_alice["code"] == "INVALID_MOVE"
            print("[OK] Server rejected out-of-turn move from Alice.")

            # Turn 2: Bob places O at 0 (Top-left)
            print("[Turn 2] Bob plays cell 0...")
            ws_bob.send_text(json.dumps({"type": "MOVE", "cell_index": 0}))
            ws_alice.receive_json()
            ws_bob.receive_json()

            # Anti-Cheat: Bob attempts to overwrite Alice's cell 4
            print("[Anti-Cheat Test] Bob attempts to overwrite cell 4...")
            # X turn now, so Alice plays 3 first
            ws_alice.send_text(json.dumps({"type": "MOVE", "cell_index": 3}))
            ws_alice.receive_json()
            ws_bob.receive_json()

            # Now Bob's turn, tries to overwrite cell 4
            ws_bob.send_text(json.dumps({"type": "MOVE", "cell_index": 4}))
            err_bob = ws_bob.receive_json()
            assert err_bob["type"] == "ERROR"
            assert err_bob["code"] == "INVALID_MOVE"
            print("[OK] Server rejected occupied cell overwrite from Bob.")

            # Bob plays legal move at 1
            print("[Turn 3] Bob plays cell 1...")
            ws_bob.send_text(json.dumps({"type": "MOVE", "cell_index": 1}))
            ws_alice.receive_json()
            ws_bob.receive_json()

            # Turn 4: Alice plays 5 (Right middle) -> Alice has [3, 4, 5] horizontal win!
            print("[Turn 4] Alice plays cell 5 (Horizontal winning line [3, 4, 5])...")
            ws_alice.send_text(json.dumps({"type": "MOVE", "cell_index": 5}))
            final_alice = ws_alice.receive_json()
            final_bob = ws_bob.receive_json()
            assert final_alice["status"] == "WON"
            assert final_alice["winner"] == "X"
            assert final_alice["winning_line"] == [3, 4, 5]
            assert final_bob["status"] == "WON"
            assert final_bob["winner"] == "X"
            assert final_bob["winning_line"] == [3, 4, 5]
            print("[OK] Win detected and synchronized across both clients!")

            # Consume MATCH_OVER messages sent upon victory
            over_alice = ws_alice.receive_json()
            over_bob = ws_bob.receive_json()
            assert over_alice["type"] == "MATCH_OVER"
            assert over_bob["type"] == "MATCH_OVER"

            # Rematch handshake
            print("[Rematch Flow] Alice requests rematch...")
            ws_alice.send_text(json.dumps({"type": "REMATCH_REQUEST"}))
            ws_alice.receive_json()
            ws_bob.receive_json()

            print("[Rematch Flow] Bob accepts rematch...")
            ws_bob.send_text(json.dumps({"type": "REMATCH_REQUEST"}))
            reset_alice = ws_alice.receive_json()
            reset_bob = ws_bob.receive_json()
            assert reset_alice["status"] == "PLAYING"
            assert reset_bob["status"] == "PLAYING"
            assert reset_alice["board"][4] is None
            print("[OK] Rematch accepted! Board reset and both clients in PLAYING state.")

    print("\n[OK] FULL TWO-CLIENT INDEPENDENT MULTIPLAYER TEST PASSED!")

if __name__ == "__main__":
    simulate_two_player_duel()
