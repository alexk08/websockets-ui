import { WebSocketServer } from 'ws';
import { BaseMessage, BasePlayerData, RegPlayerInMsg, RegPlayerOutMsg } from '../types';
import { createPlayer } from '../controller';

const WS_PORT = 3050;

const ws = new WebSocketServer({ port: WS_PORT });

ws.on('connection', function connection(ws, req) {
  const remoteAddress = req.socket.remoteAddress;

  // Обработка ошибки
  ws.on('error', console.error);

  // Отправляем JSON
  ws.send(
    JSON.stringify({
      cmd: 'getuserlist',
      stn: true,
    }),
  );

  // принимаем JSON
  ws.on('message', function message(rawData) {
    const data = JSON.parse(rawData.toString()) as BaseMessage;
    console.log('Data from  %s : %j', remoteAddress, data);

    if (data.type === 'reg') {
      const player = JSON.parse((data as RegPlayerInMsg).data as unknown as string) as BasePlayerData;
      const outData = createPlayer(player);
      const outMsg: RegPlayerOutMsg = { type: 'reg', data: JSON.stringify(outData) as BaseMessage['data'], id: 0 };
      ws.send(JSON.stringify(outMsg));
    }
  });

  ws.on('close', () => {
    ws.close();
  });
});
