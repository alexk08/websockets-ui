import { WebSocket } from 'ws';
import { PlayerError } from '../error';
import { GameService } from '../services';
import { PlayerData, PlayerDataOut, BasePlayer, AddShipData } from '../types';

const game = new GameService();

export const createPlayer = (player: PlayerData, socket: WebSocket) => {
  let playerOutMsg: PlayerDataOut = { name: player.name, index: '', error: false, errorText: '' };
  try {
    const newPlayer = game.createPlayer(player, socket);
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

export const createGame = (roomId: string | number, playerIndex: string | number) => {
  return game.createGame(roomId, playerIndex);
};

export const addShips = (shipData: AddShipData) => {
  game.addShips(shipData);
};

export const checkGameIsReady = (idGame: string | number) => {
  return game.checkGameIsReady(idGame);
};

export const getAvailableRooms = () => game.getAvailableRooms();

export const getWinners = () => game.getWinners();

export const getGames = () => game.getGames();
