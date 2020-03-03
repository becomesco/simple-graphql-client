export interface GQL {
  isInitialized: () => boolean;
  send: (template: string, variables?: any) => Promise<any>;
  clear: () => void;
}
