"""
XO Games - Server-Authoritative Game Engine
Mirror of the deterministic frontend rules engine.
"""

from typing import List, Optional, Tuple

def create_empty_board(size: int) -> List[Optional[str]]:
    return [None] * (size * size)

def get_winning_lines(size: int) -> List[List[int]]:
    """
    Computes all winning combinations.
    3x3 -> 3 in a row
    4x4 -> 4 in a row
    5x5 -> 4 in a row
    """
    lines: List[List[int]] = []
    win_length = 3 if size == 3 else 4

    # 1. Horizontal Rows
    for r in range(size):
        for c in range(size - win_length + 1):
            line = [r * size + (c + k) for k in range(win_length)]
            lines.append(line)

    # 2. Vertical Columns
    for c in range(size):
        for r in range(size - win_length + 1):
            line = [(r + k) * size + c for k in range(win_length)]
            lines.append(line)

    # 3. Diagonal Down-Right (\)
    for r in range(size - win_length + 1):
        for c in range(size - win_length + 1):
            line = [(r + k) * size + (c + k) for k in range(win_length)]
            lines.append(line)

    # 4. Diagonal Up-Right (/)
    for r in range(win_length - 1, size):
        for c in range(size - win_length + 1):
            line = [(r - k) * size + (c + k) for k in range(win_length)]
            lines.append(line)

    return lines

_CACHED_LINES = {
    3: get_winning_lines(3),
    4: get_winning_lines(4),
    5: get_winning_lines(5),
}

def check_winner(board: List[Optional[str]], size: int) -> Tuple[Optional[str], bool, Optional[List[int]]]:
    """
    Returns (winner, is_draw, winning_line)
    """
    lines = _CACHED_LINES.get(size, get_winning_lines(size))

    for line in lines:
        first = board[line[0]]
        if not first:
            continue
        match = True
        for idx in line[1:]:
            if board[idx] != first:
                match = False
                break
        if match:
            return first, False, line

    # Check for Draw
    if all(cell is not None for cell in board):
        return None, True, None

    return None, False, None

def is_valid_move(board: List[Optional[str]], index: int, status: str) -> bool:
    if status != "PLAYING":
        return False
    if index < 0 or index >= len(board):
        return False
    return board[index] is None

def make_move(board: List[Optional[str]], index: int, mark: str) -> List[Optional[str]]:
    next_board = list(board)
    next_board[index] = mark
    return next_board
