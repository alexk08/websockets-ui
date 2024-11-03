import { WebSocket } from 'ws';
import { PlayerError } from '../error';
import { GameService } from '../services';
import { PlayerData, PlayerDataOut, AddShipData, Room, AttackInData, BaseGameData } from '../types';
import { formatOutMsg, log } from '../utils';
import { ws } from '../ws_server';

const game = new GameService();

export const handleRegistration = ({
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

    ws.emit('updateWinners');
    ws.emit('updateRooms');

    log('reg', playerResult);
  }
};

export const handleCreateRoom = ({ clientId }: HandleParams) => {
  if (!clientId) return;
  const room = game.createRoom(clientId);
  ws.emit('updateWinners');
  ws.emit('updateRooms');

  log('create_room', room);
};

export const handleAddUserToRoom = ({ clientId, room }: HandleParams & { room: Room }) => {
  if (!clientId) return;
  const createdGame = game.createGame(room.indexRoom, clientId);
  if (!createdGame) return;

  ws.emit('updateRooms');

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

export const handleAddShips = ({ clientId, shipData }: HandleParams & { shipData: AddShipData }) => {
  const currentGame = game.addShips(shipData);
  if (!game.checkGameIsReady(shipData.gameId) || !clientId || !currentGame) return;

  const turnData = { currentPlayer: clientId };
  game.saveNextPlayer({ id: clientId, gameId: currentGame.idGame });
  currentGame.gamePLayers.forEach(item => {
    if (item.player.socket.readyState === WebSocket.OPEN) {
      const msg = formatOutMsg({
        data: { ships: item.ships, currentPlayerIndex: item.player.index },
        type: 'start_game',
      });
      const turnMsg = formatOutMsg({ type: 'turn', data: turnData });
      item.player.socket.send(msg);
      item.player.socket.send(turnMsg);
    }
  });

  log('start_game', currentGame);
  log('turn', turnData);
};

export const handleAttack = ({ attackData }: { attackData: AttackInData }) => {
  const nextPlayerId = game.getNextPlayer(attackData.gameId);
  if (!game.checkIsRightTurn({ nextPlayerId, currentShoter: attackData.indexPlayer })) return;
  const { enemyId, ...resultOfAttack } = game.attack(attackData);

  if (!enemyId) return;
  const currentGame = game.getGames().find(game => game.idGame === attackData.gameId);
  const turnData = { currentPlayer: resultOfAttack.status === 'miss' ? enemyId : attackData.indexPlayer };
  game.saveNextPlayer({ gameId: attackData.gameId, id: turnData.currentPlayer });

  currentGame?.gamePLayers.forEach(item => {
    if (item.player.socket.readyState === WebSocket.OPEN) {
      const msg = formatOutMsg({
        data: resultOfAttack,
        type: 'attack',
      });
      const turnMsg = formatOutMsg({ type: 'turn', data: turnData });
      item.player.socket.send(msg);
      item.player.socket.send(turnMsg);
    }
  });

  log('attack', resultOfAttack);
  log('turn', turnData);
};

export const handleRandomAttack = ({ attackData }: { attackData: BaseGameData }) => {
  const nextPlayerId = game.getNextPlayer(attackData.gameId);
  if (!game.checkIsRightTurn({ nextPlayerId, currentShoter: attackData.indexPlayer })) return;
  const randomAttackData = game.randomAttack(attackData);
  handleAttack({ attackData: randomAttackData });
};

export const handleUpdateWinners = () => {
  const data = game.getWinners();
  const updateWinnersOutMsg = formatOutMsg({ data, type: 'update_winners' });
  ws.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(updateWinnersOutMsg);
    }
  });

  log('update_winners', data);
};

export const handleUpdateRooms = () => {
  const data = game.getAvailableRooms();
  const updatedRoomOutMsg = formatOutMsg({ data, type: 'update_room' });
  ws.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(updatedRoomOutMsg);
    }
  });

  log('update_room', data);
};

export const handleShutDownServer = () => {
  console.log('\nShutting down WebSocket server...');
  ws.clients.forEach(client => client.close());
  ws.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
};

export type HandleParams = {
  wsClient?: WebSocket;
  clientId?: string | number;
};
