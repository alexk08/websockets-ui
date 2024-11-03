import { WebSocketServer } from 'ws';
import { httpServer } from '../http_server/index';

export const ws = new WebSocketServer({ server: httpServer });
