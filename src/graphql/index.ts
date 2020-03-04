import { LocalStorage, Storage } from '../storage';
import { GQL } from './interfaces/gql.interface';
import { JWT } from './interfaces/jwt.interface';
import * as GraphQLClient from 'graphql-client';

export class GraphQLFactory {
  public static async instance(
    serverURL: string,
    loginURI?: string,
    noAuth?: boolean,
  ): Promise<GQL> {
    const storage: LocalStorage = new LocalStorage('ppgql_');
    let initialized: boolean = false;
    let accessToken: JWT;
    let refreshToken: string = storage.get('rt');
    const client = GraphQLClient({ url: serverURL });
    if (typeof refreshToken !== 'undefined') {
      initialized = true;
      const refreshResult = await this.refresh(
        client,
        accessToken,
        refreshToken,
        storage,
      );
      initialized = refreshResult;
    } else {
      if (!noAuth) {
        const refreshResult = await this.refresh(
          client,
          accessToken,
          refreshToken,
          storage,
        );
        initialized = refreshResult;
      }
    }
    async function send(template: string, variables?: any): Promise<any> {
      if (!noAuth && template.indexOf('$accessToken') !== -1) {
        const refreshResult = await GraphQLFactory.refresh(
          client,
          accessToken,
          refreshToken,
          storage,
        );
        initialized = refreshResult;
        if (refreshResult === false) {
          clear();
        }
        if (variables) {
          variables.accessToken = storage.get('at');
        } else {
          variables = {
            accessToken: storage.get('at'),
          };
        }
      }
      const result = await client.query(template, variables);
      return result.data;
    }
    function clear() {
      initialized = false;
      storage.remove('at');
      storage.remove('rt');
      if (typeof loginURI === 'string') {
        window.location.href = loginURI;
      }
    }
    function isInitialized() {
      return initialized;
    }
    return {
      isInitialized,
      send,
      clear,
      initialize: (AccessToken: string, RefreshToken: string) => {
        GraphQLFactory.initializeTokens(AccessToken, RefreshToken, storage);
      },
    };
  }

  private static async refresh(
    client: any,
    accessToken: JWT,
    refreshToken: string,
    storage: Storage,
  ) {
    if (refreshToken) {
      if (accessToken) {
        if (accessToken.payload.iat + accessToken.payload.exp > Date.now()) {
          return true;
        }
      }
      const result = await client.query(
        `
        mutation ($refreshToken: String!) {
          refresh(refreshToken: $refreshToken) {
            error {
              status
              message
            }
            edge {
              accessToken
            }
          }
        }
      `,
        {
          refreshToken,
        },
      );
      if (result.data.refresh.error !== null) {
        console.error(result);
        return false;
      }
      storage.set('at', result.data.refresh.edge.accessToken);
      accessToken = JSON.parse(
        Buffer.from(
          result.data.refresh.edge.accessToken.split('.')[1],
          'base64',
        ).toString(),
      );
      return true;
    }
    console.error('Refresh token is missing.');
    return false;
  }

  private static initializeTokens(
    accessToken: string,
    refreshToken: string,
    storage: Storage,
  ) {
    if (typeof accessToken !== 'string') {
      throw new Error('"accessToken" must be of type "string".');
    }
    if (typeof refreshToken !== 'string') {
      throw new Error('"refreshToken" must be of type "string".');
    }
    if (accessToken.split('.').length !== 3) {
      throw new Error('Invalid "accessToken" was provided.');
    }
    storage.set('at', accessToken);
    storage.set('rt', refreshToken);
  }
}
