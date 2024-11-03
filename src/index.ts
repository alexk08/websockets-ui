import { handleShutDownServer, handleUpdateRooms, handleUpdateWinners } from './controller/handlers';
import { handleWsConnection } from './controller/handleWsConnection';
import { httpServer } from './http_server';
import { ws } from './ws_server';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
console.log(`WebSocket server started on ws://localhost:${HTTP_PORT}`);

ws.on('connection', handleWsConnection);

ws.on('updateWinners', handleUpdateWinners);

ws.on('updateRooms', handleUpdateRooms);

process.on('SIGINT', handleShutDownServer);

httpServer.listen(HTTP_PORT);
