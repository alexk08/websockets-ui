import { WebSocket } from 'ws';
import { PlayerError } from '../error';
import {
  PlayerData,
  Player,
  RoomState,
  Winner,
  Game,
  AddShipData,
  AttackInData,
  Ship,
  Position,
  AttackOutData,
  BaseGameData,
} from '../types';
import { v4 as uuid_v4 } from 'uuid';

export class GameService {
  private players: Player[];
  private availableRooms: RoomState[];
  private winners: Winner[];
  private games: Game[];

  constructor() {
    this.players = [];
    this.availableRooms = [];
    this.winners = [];
    this.games = [];
  }

  createPlayer(player: PlayerData, socket: WebSocket, index: string | number) {
    this.validatePlayer(player);
    const newPlayer: Player = { ...player, index, socket };
    this.players.push(newPlayer);
    return newPlayer;
  }

  createRoom(playerIndex: string | number) {
    const roomId = uuid_v4();
    const roomUser = this.players.find(item => item.index === playerIndex);
    if (!roomUser) return null;

    const newRoom: RoomState = { roomId, roomUsers: [roomUser] };
    this.availableRooms.push(newRoom);
    return newRoom;
  }

  createGame(roomId: string | number, playerIndex: string | number) {
    const roomIdx = this.availableRooms.findIndex(item => item.roomId === roomId);
    const roomUser = this.players.find(({ index }) => index === playerIndex);
    const isSamePlayer = this.availableRooms[roomIdx].roomUsers.some(({ index }) => index === playerIndex);

    if (roomIdx < 0 || !roomUser || isSamePlayer) return null;

    this.availableRooms[roomIdx].roomUsers.push(roomUser);
    const { roomUsers } = this.availableRooms[roomIdx];
    const newGame: Game = { idGame: roomId, gamePLayers: roomUsers.map(player => ({ player, ships: [], shots: [] })) };
    this.availableRooms.splice(roomIdx);
    this.games.push(newGame);
    return newGame;
  }

  addShips(shipData: AddShipData) {
    const game = this.games.find(game => game.idGame === shipData.gameId);
    const gamePlayer = game?.gamePLayers.find(gamePlayer => gamePlayer.player.index === shipData.indexPlayer);

    if (!gamePlayer) return;
    gamePlayer.ships = shipData.ships;

    return game;
  }

  checkGameIsReady(idGame: string | number) {
    return this.games.find(game => game.idGame === idGame)?.gamePLayers.every(player => !!player.ships.length);
  }

  attack(attackData: AttackInData): (AttackOutData & { enemyId: string | number }) | undefined {
    const { gameId, x, y, indexPlayer } = attackData;
    const nextPlayerId = this.getNextPlayer(gameId);
    const isRightTurn = this.checkIsRightTurn({ nextPlayerId, currentShoter: indexPlayer, x, y, gameId });
    if (!isRightTurn) return;

    const game = this.games.find(game => game.idGame === gameId);
    if (!game) return;

    const enemy = game.gamePLayers.find(item => item.player.index !== indexPlayer);
    const client = game.gamePLayers.find(item => item.player.index === indexPlayer);
    if (!enemy || !client) return;

    const enemyShips = enemy.ships;
    const clientShots = client.shots;

    clientShots.push({ x, y });

    const isShot = enemyShips.some(ship => this.checkShipIsShot(ship, { x, y }));

    return {
      position: { x, y },
      status: isShot ? 'shot' : 'miss',
      currentPlayer: indexPlayer,
      enemyId: enemy.player.index,
    };
  }

  randomAttack(attackData: BaseGameData): AttackInData {
    const { gameId, indexPlayer } = attackData;
    const game = this.games.find(game => game.idGame === gameId);

    const client = game?.gamePLayers.find(item => item.player.index === indexPlayer);
    const clientShots = client?.shots ?? [];
    const allShots = [];

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        allShots.push({ x, y });
      }
    }

    const shuffledShots = allShots.sort(() => Math.random() - 0.5);
    const { x, y } = shuffledShots.find(({ x, y }) => !clientShots.some(shot => shot.x === x && shot.y === y)) ?? {
      x: 0,
      y: 0,
    };

    return { gameId, indexPlayer, x, y };
  }

  checkShipIsShot(ship: Ship, shotPosition: Position) {
    const { x, y } = shotPosition;
    const { direction, length, position } = ship;
    const shipObj = {
      x: !direction ? Array.from({ length }, (_, i) => i + position.x) : [position.x],
      y: direction ? Array.from({ length }, (_, i) => i + position.y) : [position.y],
    };

    return shipObj.x.some(value => value === x) && shipObj.y.some(value => value === y);
  }

  checkIsRightTurn({
    nextPlayerId,
    currentShoter,
    gameId,
    x,
    y,
  }: {
    nextPlayerId: string | number | undefined;
    currentShoter: string | number;
    gameId: string | number;
    x: number;
    y: number;
  }) {
    const isPreviousTurn = this.games
      .find(game => game.idGame === gameId)
      ?.gamePLayers.find(player => player.player.index === currentShoter)
      ?.shots.some(shot => shot.x === x && shot.y === y);
    return nextPlayerId === currentShoter && !isPreviousTurn;
  }

  saveNextPlayer({ id, gameId }: { id: string | number; gameId: string | number }) {
    const game = this.games.find(game => game.idGame === gameId);
    if (game) game.nextPlayerId = id;
  }

  getNextPlayer(gameId: string | number) {
    const game = this.games.find(game => game.idGame === gameId);
    return game?.nextPlayerId;
  }

  getAvailableRooms() {
    return this.availableRooms.map(room => ({
      ...room,
      roomUsers: room.roomUsers.map(user => ({ name: user.name, index: user.index })),
    }));
  }

  getWinners() {
    return this.winners;
  }

  getGames() {
    return this.games;
  }

  private validatePlayer(player: PlayerData) {
    const idx = this.players.findIndex(item => item.name === player.name);
    if (idx >= 0) throw new PlayerError('This name alredy exist');
  }
}
