from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Literal

class CreateRoomRequest(BaseModel):
    board_size: Literal[3, 4, 5] = Field(default=3, description="Board dimension (3, 4, or 5)")
    creator_name: str = Field(default="Pilot_01", min_length=1, max_length=24)

class CreateRoomResponse(BaseModel):
    room_code: str
    board_size: int
    player_id: str
    symbol: str
    ws_url: str

class JoinRoomRequest(BaseModel):
    player_name: str = Field(default="Rival_02", min_length=1, max_length=24)

class JoinRoomResponse(BaseModel):
    room_code: str
    board_size: int
    player_id: str
    symbol: str
    ws_url: str

class HealthResponse(BaseModel):
    status: str
    version: str
    active_rooms: int
    timestamp: int

class PlayerInfo(BaseModel):
    id: str
    name: str
    connected: bool
    score: int = 0

class RoomStateMessage(BaseModel):
    type: Literal["ROOM_STATE"] = "ROOM_STATE"
    room_code: str
    board_size: int
    board: List[Optional[str]]
    current_turn: str
    status: str
    winning_line: Optional[List[int]] = None
    winner: Optional[str] = None
    players: Dict[str, PlayerInfo]
    rematch_requested_by: Optional[List[str]] = None

class MatchOverMessage(BaseModel):
    type: Literal["MATCH_OVER"] = "MATCH_OVER"
    status: str
    winner: Optional[str]
    winning_line: Optional[List[int]]
    board: List[Optional[str]]

class ErrorMessage(BaseModel):
    type: Literal["ERROR"] = "ERROR"
    code: str
    message: str

class OpponentDisconnectedMessage(BaseModel):
    type: Literal["OPPONENT_DISCONNECTED"] = "OPPONENT_DISCONNECTED"
    message: str

