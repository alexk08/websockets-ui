import { WebSocket, Server } from 'ws';
import { PlayerError } from '../error';
import { GameService } from '../services';
import { PlayerData, PlayerDataOut, AddShipData, Room } from '../types';
import { formatOutMsg, log } from '../utils';

const game = new GameService();

export const handleRegistration = ({
  ws,
  wsClient,
  playerParams,
  clientId,
}: { playerParams: PlayerData } & HandleParams) => {
  if (!wsClient || !clientId) return;
  let playerResult: PlayerDataOut = { name: playerParams.name, index: '', error: false, errorText: '' };
  try {
    const newPlayer = game.createPlayer(playerParams, wsClient, clientId);
    playerResult = { ...playerResult, name: newPlayer.name, index: newPlayer.index };
  } catch (e) {
    playerResult = { ...playerResult, error: true, errorText: (e as PlayerError).message };
  } finally {
    const createPlayerOutMsg = formatOutMsg({ data: playerResult, type: 'reg' });
    wsClient.send(createPlayerOutMsg);

    ws?.emit('updateWinners');
    ws?.emit('updateRooms');

    log('reg', playerResult);
  }
};

export const handleCreateRoom = ({ ws, clientId }: HandleParams) => {
  if (!clientId) return;
  const room = game.createRoom(clientId);
  ws?.emit('updateWinners');
  ws?.emit('updateRooms');

  log('create_room', room);
};

export const handleAddUserToRoom = ({ ws, clientId, room }: HandleParams & { room: Room }) => {
  if (!clientId) return;
  const createdGame = game.createGame(room.indexRoom, clientId);
  if (!createdGame) return;

  ws?.emit('updateRooms');

  createdGame.gamePLayers.forEach(item => {
    if (item.player.socket.readyState === WebSocket.OPEN) {
      const msg = formatOutMsg({
        data: { idGame: createdGame.idGame, idPlayer: item.player.index },
        type: 'create_game',
      });
      item.player.socket.send(msg);
    }
  });

  log('create_game', createdGame);
};

export const handleAddShips = ({ shipData }: HandleParams & { shipData: AddShipData }) => {
  const currentGame = game.addShips(shipData);
  if (!game.checkGameIsReady(shipData.gameId)) return;

  currentGame?.gamePLayers.forEach(item => {
    if (item.player.socket.readyState === WebSocket.OPEN) {
      const msg = formatOutMsg({
        data: { ships: item.ships, currentPlayerIndex: item.player.index },
        type: 'start_game',
      });
      item.player.socket.send(msg);
    }
  });

  log('start_game', currentGame);
};

export const handleUpdateWinners = ({ ws }: HandleParams) => {
  const data = game.getWinners();
  const updateWinnersOutMsg = formatOutMsg({ data, type: 'update_winners' });
  ws?.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(updateWinnersOutMsg);
    }
  });

  log('update_winners', data);
};

export const handleUpdateRooms = ({ ws }: HandleParams) => {
  const data = game.getAvailableRooms();
  const updatedRoomOutMsg = formatOutMsg({ data, type: 'update_room' });
  ws?.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(updatedRoomOutMsg);
    }
  });

  log('update_room', data);
};

export type HandleParams = {
  ws?: Server;
  wsClient?: WebSocket;
  clientId?: string | number;
};
