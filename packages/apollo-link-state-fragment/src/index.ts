import { toIdValue } from "apollo-utilities";
import { withClientState } from "apollo-link-state";
import { ApolloCache } from 'apollo-cache';
import { defaultDataIdFromObject } from 'apollo-cache-inmemory';

export function fragmentCacheRedirect(dataIdFromObject = defaultDataIdFromObject) {
  return {
    getFragment: (_, { id, __typename }) => {
      return toIdValue(dataIdFromObject({ __typename, id }));
    }
  };
}

export function fragmentLinkState(apolloCache: ApolloCache<any>) {
  return withClientState({
    cache: apolloCache,
    resolvers: {
      Query: {
        getFragment: (_, { __typename, id }, { cache }) => {
          const fragmentId = cache.config.dataIdFromObject({ __typename, id });
          return cache.data.data[fragmentId];
        }
      }
    }
  });
}
