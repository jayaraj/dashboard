import { Header } from './types';

export const MoveHeaders = (headers: Header[], from: number, to: number) => {
  const header = headers[from];
  headers.splice(from, 1);
  headers.splice(to, 0, header);
};
