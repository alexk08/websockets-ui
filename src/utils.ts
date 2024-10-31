import WebSocket from 'ws';
import { CommandType, BaseMessage } from './types';

export const formatInMsg = (rawData: WebSocket.RawData) => {
  const { type, data } = JSON.parse(rawData.toString()) as BaseMessage;
  return { type, data: data ? (JSON.parse(data) as Record<string, unknown> | Record<string, unknown>[]) : data };
};

export const formatOutMsg = <DataType extends Record<string, unknown> | Record<string, unknown>[]>({
  type,
  ...rest
}: {
  data: DataType;
  type: CommandType;
}) => {
  const data = JSON.stringify(rest.data);
  return JSON.stringify({ data, type, id: 0 });
};
