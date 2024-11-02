import { WebSocket, WebSocketServer } from 'ws';
import { AddShipData, PlayerData, PlayerDataOut, Room } from '../types';
import {
  addShips,
  checkGameIsReady,
  createGame,
  createPlayer,
  createRoom,
  getAvailableRooms,
  getGames,
  getWinners,
} from '../controller';
import { formatInMsg, formatOutMsg } from '../utils';

const WS_PORT = 3050;

const ws = new WebSocketServer({ port: WS_PORT });

ws.on('connection', function connection(wsClient, req) {
  const remoteAddress = req.socket.remoteAddress;
  let player: null | PlayerDataOut = null;

  // Обработка ошибки
  wsClient.on('error', console.error);

  wsClient.on('message', function message(rawData) {
    const { type, data } = formatInMsg(rawData);
    console.log('Data from  %s : %j', remoteAddress, data);

    if (type === 'reg') {
      const playerParams = data as PlayerData;
      player = createPlayer(playerParams, wsClient);

      const createPlayerOutMsg = formatOutMsg({ data: player, type });
      wsClient.send(createPlayerOutMsg);

      ws.emit('updateWinners');
      ws.emit('updateRooms');
    }

    if (type === 'create_room') {
      if (!player) return;
      createRoom({ index: player.index, name: player.name });
      ws.emit('updateWinners');
      ws.emit('updateRooms');
    }

    if (type === 'add_user_to_room') {
      if (!player) return;
      const roomId = (data as Room).indexRoom;
      const game = createGame(roomId, player.index);
      if (!game) return;

      ws.emit('updateRooms');

      game.gamePLayers.forEach(item => {
        if (item.player.socket.readyState === WebSocket.OPEN) {
          const msg = formatOutMsg({ data: { idGame: game.idGame, idPlayer: item.player.index }, type: 'create_game' });
          item.player.socket.send(msg);
        }
      });
    }

    if (type === 'add_ships') {
      const shipData = data as AddShipData;
      addShips(shipData);
      if (!checkGameIsReady(shipData.gameId)) return;

      const game = getGames().find(game => game.idGame === shipData.gameId);
      game?.gamePLayers.forEach(item => {
        if (item.player.socket.readyState === WebSocket.OPEN) {
          const msg = formatOutMsg({
            data: { ships: item.ships, currentPlayerIndex: item.player.index },
            type: 'start_game',
          });
          item.player.socket.send(msg);
        }
      });
    }
  });

  wsClient.on('close', () => {
    wsClient.close();
  });
});

ws.on('updateWinners', () => {
  const updateWinnersOutMsg = formatOutMsg({ data: getWinners(), type: 'update_winners' });
  ws.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(updateWinnersOutMsg);
    }
  });
});

ws.on('updateRooms', () => {
  const updatedRoomOutMsg = formatOutMsg({ data: getAvailableRooms(), type: 'update_room' });
  ws.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(updatedRoomOutMsg);
    }
  });
});
