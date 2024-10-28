import { WebSocketServer } from 'ws';

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
    const data = JSON.parse(rawData.toString());
    console.log(remoteAddress);
    console.log('Data from  %s : %j', remoteAddress, data);

    if (data.success && data.success.count == 40) {
      // TODO: Call an url ...
    }
  });
});
