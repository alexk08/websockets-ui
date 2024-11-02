import { WebSocket } from 'ws';

export type CommandTypeIn = 'reg' | 'create_room' | 'add_user_to_room' | 'add_ships' | 'randomAttack' | 'attack';
export type CommandTypeOut =
  | 'reg'
  | 'update_winners'
  | 'create_room'
  | 'create_game'
  | 'update_room'
  | 'start_game'
  | 'attack'
  | 'turn'
  | 'finish';

export type CommandType = CommandTypeIn | CommandTypeOut;

export type ShipType = 'small' | 'medium' | 'large' | 'huge';

export type AttackStatus = 'miss' | 'killed' | 'shot';

export type PlayerErr = {
  error: boolean;
  errorText: string;
};

export type PlayerData = {
  name: string;
  password: string;
};

export type BasePlayer = {
  name: string;
  index: number | string;
};

export type PlayerDataOut = BasePlayer & PlayerErr;

export type Winner = {
  name: string;
  wins: number;
};

export type Room = {
  indexRoom: string | number;
};

export type Game = {
  idGame: number | string;
  gamePLayers: { player: Player; ships: Ship[] }[];
};

export type GameMsg = {
  idGame: number | string;
  /**
   * generated by server id for player in the game session, not enemy (unique id for every player)
   */
  idPlayer: number | string;
};

export type RoomState = {
  roomId: number | string;
  roomUsers: Player[];
};

export interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: ShipType;
}

export type BaseGameData = {
  gameId: number | string;
  /**
   * id of the player in the current game session
   */
  indexPlayer: number | string;
};

export type Position = {
  x: number;
  y: number;
};

export type AddShipData = BaseGameData & {
  ships: Ship[];
};

export type StartGameData = {
  /**
   * player's ships, not enemy's
   */
  ships: Ship[];
  /**
   * id of the player in the current game session, who have sent his ships
   */
  currentPlayerIndex: number | string;
};

export type AttackInData = BaseGameData & Position;

export type GameSession = {
  /**
   * id of the player in the current game session
   */
  currentPlayer: number | string;
};

export type AttackOutData = GameSession & {
  position: Position;
  status: AttackStatus;
};

export type WinInfo = {
  /**
   * id of the player in the current game session
   */
  winPlayer: number | string;
};

export interface BaseMessage {
  type: CommandType;
  data: string;
  id: 0;
}

export interface BaseInMessage extends BaseMessage {
  type: CommandTypeIn;
}

export interface BaseOutMessage extends BaseMessage {
  type: CommandTypeOut;
}

// Player

/**
 * Login or create player
 */
export interface RegPlayerInMsg {
  type: 'reg';
  data: PlayerData;
}

export interface RegPlayerOutMsg {
  type: 'reg';
  data: PlayerDataOut;
}

/**
 * Update winners (for all after every winners table update)
 */
export interface UpdWinnersOutMsg {
  type: 'update_winners';
  data: Winner[];
}

// Room

/**
 * Create new room (create game room and add yourself there)
 */
// export interface CreateRoomInMsg {
//   type: 'create_room';
//   data: '';
// }

/**
 * Add user to room (add youself to somebodys room, then remove the room from available rooms list)
 */
export interface AddUserToRoomInMsg {
  type: 'add_user_to_room';
  data: Room;
}

/**
 * send for both players in the room, after they are connected to the room
 */
export interface CreateGameOutMsg {
  type: 'create_game';
  data: GameMsg;
}

/**
 * Update room state (send rooms list, where only one player inside)
 */
export interface UpdateRoomOutMsg {
  type: 'update_room';
  data: (Pick<RoomState, 'roomId'> & { roomUsers: BasePlayer[] })[];
}

// Ships

/**
 * Add ships to the game board
 */
export interface AddShipInMsg {
  type: 'add_ships';
  data: AddShipData;
}

/**
 * Start game (only after server receives both player's ships positions)
 */
export interface StartGameOutMsg {
  type: 'start_game';
  data: StartGameData;
}

// Game

/**
 * Attack msg from client
 */
export interface AttackInMsg {
  type: 'attack';
  data: AttackInData;
}

/**
 * Attack feedback (should be sent after every shot, miss and after kill sent miss for all cells around ship too)
 */
export interface AttackOutMsg {
  type: 'attack';
  data: AttackOutData;
}

export interface RandomAttackInMsg {
  type: 'randomAttack';
  data: BaseGameData;
}

/**
 * Info about player's turn (send after game start and every attack, miss or kill result)
 */
export interface PlayerInfoOutMsg {
  type: 'turn';
  data: GameSession;
}

/**
 * Finish game
 */
export interface FinishGameOutMsg {
  type: 'finish';
  data: WinInfo;
}

export type OutMsgMap = {
  reg: RegPlayerOutMsg;
  update_winners: UpdWinnersOutMsg;
  create_room: UpdateRoomOutMsg;
  create_game: CreateGameOutMsg;
  update_room: UpdateRoomOutMsg;
  start_game: StartGameOutMsg;
  attack: AttackOutMsg;
  turn: PlayerInfoOutMsg;
  finish: FinishGameOutMsg;
};

// Models

export type Player = {
  index: string | number;
  socket: WebSocket;
} & PlayerData;