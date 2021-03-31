import { Client, Server } from 'styletron-engine-atomic';
import { DebugEngine } from 'styletron-react';

const getHydrateClass = (): HTMLCollectionOf<any> =>
  document.getElementsByClassName('_styletron_hydrate_');

export const styletron: any =
  typeof window === 'undefined'
    ? new Server()
    : new Client({
        hydrate: getHydrateClass(),
      });

export const debug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
