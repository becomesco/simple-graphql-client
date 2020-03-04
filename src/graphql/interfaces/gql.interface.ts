export interface GQL {
  isInitialized: () => boolean;
  send: (template: string, variables?: any) => Promise<any>;
  clear: () => void;
  initialize: (accessToken: string, refreshToken: string) => void;
}
