import { WebSocketServer } from 'ws';
import { AddShipData, PlayerData, Room } from '../types';
import {
  handleAddShips,
  handleAddUserToRoom,
  handleCreateRoom,
  handleRegistration,
  handleUpdateRooms,
  handleUpdateWinners,
} from '../controller';
import { formatInMsg } from '../utils';
import { v4 as uuid_v4 } from 'uuid';

const WS_PORT = 3050;

const ws = new WebSocketServer({ port: WS_PORT });

console.log(`WebSocket server started on ws://localhost:${WS_PORT}`);

ws.on('connection', function connection(wsClient, req) {
  const remoteAddress = req.socket.remoteAddress;
  const clientId = uuid_v4();
  console.log(`Client with ID: ${clientId}, IP-adress: ${remoteAddress} connected`);

  wsClient.on('error', err => {
    console.error('Connection error:', err);
  });

  wsClient.on('message', function message(rawData) {
    const { type, data } = formatInMsg(rawData);
    console.log('Received command:', type, 'with data:', data);

    if (type === 'reg') handleRegistration({ ws, wsClient, playerParams: data as PlayerData, clientId });

    if (type === 'create_room') handleCreateRoom({ ws, clientId });

    if (type === 'add_user_to_room') handleAddUserToRoom({ ws, clientId, room: data as Room });

    if (type === 'add_ships') handleAddShips({ shipData: data as AddShipData });
  });

  wsClient.on('close', () => {
    console.log(`Client with ID: ${clientId}, IP-adress: ${remoteAddress} disconnected`);
  });
});

ws.on('updateWinners', () => handleUpdateWinners({ ws }));

ws.on('updateRooms', () => handleUpdateRooms({ ws }));

process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  ws.clients.forEach(client => client.close());
  ws.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});
