export interface Storage {
  get: (key: string) => any | undefined;
  set: (key: string, value: any) => boolean;
  remove: (key: string) => boolean;
}
