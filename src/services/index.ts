import { PlayerError } from '../error';
import { BasePlayerData, Player } from '../types';
import { v4 as uuid_v4 } from 'uuid';

export class GameService {
  private players: Player[];

  constructor() {
    this.players = [];
  }

  createPlayer(player: BasePlayerData) {
    this.validatePlayer(player);
    const id = uuid_v4();
    const newPlayer = { ...player, id };
    this.players.push({ ...player, id });
    return newPlayer;
  }

  private validatePlayer(player: BasePlayerData) {
    const idx = this.players.findIndex(item => item.name === player.name);
    if (idx >= 0) throw new PlayerError('This name alredy exist');
  }
}
