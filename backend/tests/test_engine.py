import unittest
import sys
import os

# Add parent directory to sys.path to import app modules directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.engine import create_empty_board, check_winner, is_valid_move, make_move
from app.rooms import Room, RoomManager

class TestGameEngine(unittest.TestCase):
    def test_3x3_horizontal_win(self):
        board = ["X", "X", "X", None, "O", "O", None, None, None]
        winner, is_draw, line = check_winner(board, 3)
        self.assertEqual(winner, "X")
        self.assertFalse(is_draw)
        self.assertEqual(line, [0, 1, 2])

    def test_3x3_vertical_win(self):
        board = ["O", "X", None, "O", "X", None, "O", None, None]
        winner, is_draw, line = check_winner(board, 3)
        self.assertEqual(winner, "O")
        self.assertFalse(is_draw)
        self.assertEqual(line, [0, 3, 6])

    def test_3x3_diagonal_win(self):
        board = ["X", "O", None, None, "X", "O", None, None, "X"]
        winner, is_draw, line = check_winner(board, 3)
        self.assertEqual(winner, "X")
        self.assertFalse(is_draw)
        self.assertEqual(line, [0, 4, 8])

    def test_3x3_draw(self):
        board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"]
        winner, is_draw, line = check_winner(board, 3)
        self.assertIsNone(winner)
        self.assertTrue(is_draw)
        self.assertIsNone(line)

    def test_4x4_four_in_a_row_win(self):
        board = create_empty_board(4)
        # Fill row 2: indices 8, 9, 10, 11
        for idx in [8, 9, 10, 11]:
            board[idx] = "X"
        winner, is_draw, line = check_winner(board, 4)
        self.assertEqual(winner, "X")
        self.assertEqual(line, [8, 9, 10, 11])

    def test_4x4_diagonal_win(self):
        board = create_empty_board(4)
        # Main diagonal: 0, 5, 10, 15
        for idx in [0, 5, 10, 15]:
            board[idx] = "O"
        winner, is_draw, line = check_winner(board, 4)
        self.assertEqual(winner, "O")
        self.assertEqual(line, [0, 5, 10, 15])

    def test_5x5_four_in_a_row_win(self):
        board = create_empty_board(5)
        # 4 in a row along row 1: 6, 7, 8, 9
        for idx in [6, 7, 8, 9]:
            board[idx] = "X"
        winner, is_draw, line = check_winner(board, 5)
        self.assertEqual(winner, "X")
        self.assertEqual(line, [6, 7, 8, 9])

    def test_invalid_moves(self):
        board = ["X", None, None, None, None, None, None, None, None]
        # Cannot move on occupied cell 0
        self.assertFalse(is_valid_move(board, 0, "PLAYING"))
        # Can move on unoccupied cell 1
        self.assertTrue(is_valid_move(board, 1, "PLAYING"))
        # Cannot move when status is WON
        self.assertFalse(is_valid_move(board, 1, "WON"))
        # Cannot move out of bounds
        self.assertFalse(is_valid_move(board, 9, "PLAYING"))
        self.assertFalse(is_valid_move(board, -1, "PLAYING"))

    def test_room_lifecycle(self):
        mgr = RoomManager()
        room, creator_id = mgr.create_room(3, "Pilot_01")
        self.assertEqual(room.board_size, 3)
        self.assertEqual(room.status, "WAITING")

        # Second player joins
        joined = room.add_player_o("usr_opp", "Rival_02")
        self.assertTrue(joined)
        self.assertEqual(room.status, "PLAYING")

        # Third player cannot join
        third = room.add_player_o("usr_third", "Intruder")
        self.assertFalse(third)

        # Player X moves at center 4
        success, err = room.apply_move(creator_id, 4)
        self.assertTrue(success)
        self.assertEqual(room.board[4], "X")
        self.assertEqual(room.current_turn, "O")

        # Player X cannot move out of turn
        success2, err2 = room.apply_move(creator_id, 0)
        self.assertFalse(success2)

if __name__ == "__main__":
    unittest.main()
