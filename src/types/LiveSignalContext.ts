export type LiveSignalContext =
  | {
    mode: 'demo';
  }
  | {
    mode: 'user';
    userId: string;
  };
