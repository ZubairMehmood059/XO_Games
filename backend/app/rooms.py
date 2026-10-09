import time
import secrets
import string
from typing import Dict, Optional, Any, Set, Tuple, List
from .engine import create_empty_board, check_winner, is_valid_move, make_move
from .config import ROOM_TTL_SECONDS, MAX_ROOMS

def generate_room_code() -> str:
    """Generates a random room code in the form CYBER-XXX or ABC-123."""
    part1 = "".join(secrets.choice(string.ascii_uppercase) for _ in range(3))
    part2 = "".join(secrets.choice(string.digits) for _ in range(3))
    return f"{part1}-{part2}"

class Room:
    def __init__(self, room_code: str, board_size: int, creator_id: str, creator_name: str):
        self.room_code = room_code.upper()
        self.board_size = board_size
        self.created_at = time.time()
        self.last_activity = time.time()
        
        self.board = create_empty_board(board_size)
        self.current_turn = "X"
        self.status = "WAITING"  # WAITING, PLAYING, WON, DRAW
        self.winner: Optional[str] = None
        self.winning_line: Optional[List[int]] = None

        self.players: Dict[str, dict] = {
            "X": {
                "id": creator_id,
                "name": creator_name.strip() or "Pilot_01",
                "connected": False,
                "score": 0,
                "websocket": None
            }
        }
        self.rematch_requests: Set[str] = set()

    def touch(self):
        self.last_activity = time.time()

    def add_player_o(self, player_id: str, player_name: str) -> bool:
        if "O" in self.players:
            # Check if same player is re-joining
            if self.players["O"]["id"] == player_id:
                self.touch()
                return True
            return False
        self.players["O"] = {
            "id": player_id,
            "name": player_name.strip() or "Rival_02",
            "connected": False,
            "score": 0,
            "websocket": None
        }
        self.status = "PLAYING"
        self.touch()
        return True

    def get_symbol_by_player_id(self, player_id: str) -> Optional[str]:
        for symbol, info in self.players.items():
            if info["id"] == player_id:
                return symbol
        return None

    def apply_move(self, player_id: str, cell_index: int) -> Tuple[bool, Optional[str]]:
        self.touch()
        symbol = self.get_symbol_by_player_id(player_id)
        if not symbol:
            return False, "Player not recognized in this room"
        if self.status != "PLAYING":
            return False, f"Match is not active (current status: {self.status})"
        if symbol != self.current_turn:
            return False, "Not your turn"
        if not is_valid_move(self.board, cell_index, self.status):
            return False, "Invalid move: cell out of bounds or already occupied"

        self.board = make_move(self.board, cell_index, symbol)
        winner, is_draw, line = check_winner(self.board, self.board_size)

        if winner:
            self.status = "WON"
            self.winner = winner
            self.winning_line = line
            if winner in self.players:
                self.players[winner]["score"] += 1
        elif is_draw:
            self.status = "DRAW"
            self.winner = None
            self.winning_line = None
        else:
            self.current_turn = "O" if self.current_turn == "X" else "X"

        return True, None

    def apply_resign(self, player_id: str) -> Tuple[bool, Optional[str]]:
        self.touch()
        symbol = self.get_symbol_by_player_id(player_id)
        if not symbol:
            return False, "Player not recognized in this room"
        if self.status != "PLAYING":
            return False, "Cannot resign when match is not in progress"

        opponent_symbol = "O" if symbol == "X" else "X"
        self.status = "WON"
        self.winner = opponent_symbol
        self.winning_line = None
        if opponent_symbol in self.players:
            self.players[opponent_symbol]["score"] += 1

        return True, None

    def request_rematch(self, player_id: str) -> Tuple[bool, bool]:
        """
        Registers a rematch request.
        Returns (success, reset_occurred).
        """
        symbol = self.get_symbol_by_player_id(player_id)
        if not symbol:
            return False, False

        self.rematch_requests.add(player_id)
        self.touch()

        # Check if both players requested rematch (or single active player)
        connected_players = [p["id"] for p in self.players.values()]
        all_requested = all(pid in self.rematch_requests for pid in connected_players)
        
        if all_requested or len(self.players) == 1:
            self.reset_for_rematch()
            return True, True
        return True, False

    def reset_for_rematch(self):
        self.board = create_empty_board(self.board_size)
        self.status = "PLAYING"
        self.winner = None
        self.winning_line = None
        self.current_turn = "X"
        self.rematch_requests.clear()
        self.touch()

    def disconnect_player(self, player_id: str) -> Optional[str]:
        symbol = self.get_symbol_by_player_id(player_id)
        if symbol and symbol in self.players:
            self.players[symbol]["connected"] = False
            self.players[symbol]["websocket"] = None
            self.touch()
            return symbol
        return None

    def to_state_payload(self) -> dict:
        players_dict = {}
        for sym, p in self.players.items():
            players_dict[sym] = {
                "id": p["id"],
                "name": p["name"],
                "connected": p["connected"],
                "score": p["score"]
            }
        return {
            "type": "ROOM_STATE",
            "room_code": self.room_code,
            "board_size": self.board_size,
            "board": self.board,
            "current_turn": self.current_turn,
            "status": self.status,
            "winning_line": self.winning_line,
            "winner": self.winner,
            "players": players_dict,
            "rematch_requested_by": list(self.rematch_requests)
        }

class RoomManager:
    def __init__(self, room_ttl_seconds: int = ROOM_TTL_SECONDS, max_rooms: int = MAX_ROOMS):
        self.rooms: Dict[str, Room] = {}
        self.room_ttl_seconds = room_ttl_seconds
        self.max_rooms = max_rooms

    def create_room(self, board_size: int, creator_name: str) -> Tuple[Room, str]:
        self.cleanup_expired()
        if len(self.rooms) >= self.max_rooms:
            raise RuntimeError("Maximum active room capacity reached. Please try again later.")

        room_code = generate_room_code()
        while room_code in self.rooms:
            room_code = generate_room_code()

        creator_id = f"usr_{secrets.token_hex(4)}"
        room = Room(room_code, board_size, creator_id, creator_name)
        self.rooms[room_code] = room
        return room, creator_id

    def get_room(self, room_code: str) -> Optional[Room]:
        self.cleanup_expired()
        normalized = room_code.strip().upper()
        return self.rooms.get(normalized)

    def cleanup_expired(self):
        now = time.time()
        expired_keys = [
            code for code, room in self.rooms.items()
            if (now - room.last_activity > self.room_ttl_seconds)
        ]
        for key in expired_keys:
            del self.rooms[key]

room_manager = RoomManager()

