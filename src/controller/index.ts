import { PlayerError } from '../error';
import { GameService } from '../services';
import { PlayerData, PlayerDataOut, BasePlayer } from '../types';

const game = new GameService();

export const createPlayer = (player: PlayerData) => {
  let playerOutMsg: PlayerDataOut = { name: player.name, index: '', error: false, errorText: '' };
  try {
    const newPlayer = game.createPlayer(player);
    playerOutMsg = { ...playerOutMsg, name: newPlayer.name, index: newPlayer.index };
  } catch (e) {
    playerOutMsg = { ...playerOutMsg, error: true, errorText: (e as PlayerError).message };
  } finally {
    return playerOutMsg;
  }
};

export const createRoom = (player: BasePlayer) => {
  const newRoom = game.createRoom(player);
  return newRoom;
};

export const addToRoom = (roomId: string | number, player: BasePlayer) => {
  game.addToRoom(roomId, player);
};

export const getRooms = () => game.getRooms();

export const getWinners = () => game.getWinners();
