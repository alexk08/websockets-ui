import { PlayerError } from '../error';
import { PlayerData, Player, RoomState, BasePlayer, Winner } from '../types';
import { v4 as uuid_v4 } from 'uuid';

export class GameService {
  private players: Player[];
  private rooms: RoomState[];
  private winners: Winner[];

  constructor() {
    this.players = [];
    this.rooms = [];
    this.winners = [];
  }

  createPlayer(player: PlayerData) {
    this.validatePlayer(player);
    const index = uuid_v4();
    const newPlayer: Player = { ...player, index };
    this.players.push(newPlayer);
    return newPlayer;
  }

  createRoom(player: BasePlayer) {
    const roomId = uuid_v4();
    const newRoom: RoomState = { roomId, roomUsers: [player] };
    this.rooms.push(newRoom);
    return newRoom;
  }

  addToRoom(roomId: string | number, player: BasePlayer) {
    const idx = this.rooms.findIndex(item => item.roomId === roomId);
    if (idx < 0) return null;
    // this.rooms.splice(idx);
    this.rooms[idx].roomUsers.push(player);
  }

  getRooms() {
    return this.rooms;
  }

  getWinners() {
    return this.winners;
  }

  private validatePlayer(player: PlayerData) {
    const idx = this.players.findIndex(item => item.name === player.name);
    if (idx >= 0) throw new PlayerError('This name alredy exist');
  }
}
