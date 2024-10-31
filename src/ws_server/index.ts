import { WebSocketServer } from 'ws';
import { PlayerData, PlayerDataOut, Room } from '../types';
import { addToRoom, createPlayer, createRoom, getRooms, getWinners } from '../controller';
import { formatInMsg, formatOutMsg } from '../utils';

const WS_PORT = 3050;

const ws = new WebSocketServer({ port: WS_PORT });

ws.on('connection', function connection(client, req) {
  const remoteAddress = req.socket.remoteAddress;
  let player: null | PlayerDataOut = null;

  // Обработка ошибки
  client.on('error', console.error);

  // // Отправляем JSON
  // ws.send(
  //   JSON.stringify({
  //     cmd: 'getuserlist',
  //     stn: true,
  //   }),
  // );

  // принимаем JSON
  client.on('message', function message(rawData) {
    const { type, data } = formatInMsg(rawData);
    console.log('Data from  %s : %j', remoteAddress, data);

    if (type === 'reg') {
      const playerParams = data as PlayerData;
      console.log('createdPlayer before creation on specific connection, means specific client', player);
      player = createPlayer(playerParams);

      const createPlayerOutMsg = formatOutMsg({ data: player, type });
      const updateWinnersOutMsg = formatOutMsg({ data: getWinners(), type: 'update_winners' });
      const updatedRoomOutMsg = formatOutMsg({ data: getRooms(), type: 'update_room' });

      for (const cl of ws.clients) {
        cl.send(createPlayerOutMsg);
        cl.send(updateWinnersOutMsg);
        cl.send(updatedRoomOutMsg);
      }

      // client.send(createPlayerOutMsg);
      // // ws.emit('updateWinners');
      // // ws.emit('updateRooms');
      // client.send(updateWinnersOutMsg);
      // client.send(updatedRoomOutMsg);
    }

    if (type === 'create_room') {
      console.log(player);
      if (!player) return;
      createRoom({ index: player.index, name: player.name });
      // ws.emit('updateRooms');

      const updatedRoomOutMsg = formatOutMsg({ data: getRooms(), type: 'update_room' });
      const updateWinnersOutMsg = formatOutMsg({ data: getWinners(), type: 'update_winners' });

      // client.send(updatedRoomOutMsg);
      // client.send(updateWinnersOutMsg);

      for (const cl of ws.clients) {
        cl.send(updateWinnersOutMsg);
        cl.send(updatedRoomOutMsg);
      }
    }

    if (type === 'add_user_to_room') {
      if (!player) return;
      const roomId = (data as Room).indexRoom;
      addToRoom(roomId, { index: player.index, name: player.name });

      const updatedRoomOutMsg = formatOutMsg({ data: getRooms(), type: 'update_room' });

      client.send(updatedRoomOutMsg);

      for (const cl of ws.clients) {
        cl.send(updatedRoomOutMsg);
      }
    }
  });

  // ws.on('updateWinners', () => {
  //   const updateWinnersOutMsg = formatOutMsg({ data: getWinners(), type: 'update_winners' });
  //   ws.send(updateWinnersOutMsg);
  // });

  // ws.on('updateRooms', () => {
  //   const updatedRoomOutMsg = formatOutMsg({ data: getRooms(), type: 'update_room' });
  //   ws.send(updatedRoomOutMsg);
  // });

  client.on('close', () => {
    client.close();
  });
});
