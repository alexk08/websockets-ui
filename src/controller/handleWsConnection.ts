import { WebSocket } from 'ws';
import { formatInMsg } from '../utils';
import { IncomingMessage } from 'http';
import {
  handleAddShips,
  handleAddUserToRoom,
  handleAttack,
  handleCreateRoom,
  handleRandomAttack,
  handleRegistration,
} from './handlers';
import { AddShipData, AttackInData, BaseGameData, PlayerData, Room } from '../types';
import { v4 as uuid_v4 } from 'uuid';

export const handleWsConnection = (wsClient: WebSocket, req: IncomingMessage) => {
  const remoteAddress = req.socket.remoteAddress;
  const clientId = uuid_v4();
  console.log(`Client with ID: ${clientId}, IP-adress: ${remoteAddress} connected`);

  wsClient.on('error', err => {
    console.error('Connection error:', err);
  });

  wsClient.on('message', function message(rawData) {
    const { type, data } = formatInMsg(rawData);
    console.log('Received command:', type, 'with data:', data);

    if (type === 'reg') handleRegistration({ wsClient, playerParams: data as PlayerData, clientId });

    if (type === 'create_room') handleCreateRoom({ clientId });

    if (type === 'add_user_to_room') handleAddUserToRoom({ clientId, room: data as Room });

    if (type === 'add_ships') handleAddShips({ clientId, shipData: data as AddShipData });

    if (type === 'attack') handleAttack({ attackData: data as AttackInData });

    if (type === 'randomAttack') handleRandomAttack({ attackData: data as BaseGameData });
  });

  wsClient.on('close', () => {
    console.log(`Client with ID: ${clientId}, IP-adress: ${remoteAddress} disconnected`);
  });
};
