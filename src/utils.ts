import WebSocket from 'ws';
import { OutMsgMap, CommandTypeOut, BaseInMessage, BaseOutMessage, CommandType } from './types';

export const formatInMsg = (rawData: WebSocket.RawData) => {
  const { type, data } = JSON.parse(rawData.toString()) as BaseInMessage;
  return { type, data: data ? (JSON.parse(data) as Record<string, unknown> | Record<string, unknown>[]) : data };
};

export const formatOutMsg = <T extends CommandTypeOut>({ type, ...rest }: OutMsgMap[T]) => {
  const data = JSON.stringify(rest.data);
  const msg: BaseOutMessage = { data, type, id: 0 };
  return JSON.stringify(msg);
};

export const log = (type: CommandType, value?: unknown) => console.log(`Command result for ${type}:`, value ?? '');
