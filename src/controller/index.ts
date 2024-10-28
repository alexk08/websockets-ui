import { PlayerError } from '../error';
import { GameService } from '../services';
import { BasePlayerData, PlayerDataOut } from '../types';

const game = new GameService();

export const createPlayer = (player: BasePlayerData) => {
  let playerOutMsg: PlayerDataOut = { name: player.name, index: '', error: false, errorText: '' };
  try {
    const newPlayer = game.createPlayer(player);
    playerOutMsg = { ...playerOutMsg, name: newPlayer.name };
  } catch (e) {
    playerOutMsg = { ...playerOutMsg, error: true, errorText: (e as PlayerError).message };
  } finally {
    return playerOutMsg;
  }
};
