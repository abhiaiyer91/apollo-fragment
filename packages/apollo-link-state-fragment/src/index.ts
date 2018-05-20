import { toIdValue, IdValue } from 'apollo-utilities';
import { ApolloLink } from 'apollo-link';
import { withClientState } from 'apollo-link-state';
import { ApolloCache } from 'apollo-cache';
import { defaultDataIdFromObject } from 'apollo-cache-inmemory';

type GetFragmentType = {
  __typename: string;
  id: string;
};

export function fragmentCacheRedirect(
  dataIdFromObject = defaultDataIdFromObject,
) {
  return {
    getFragment: (_: any, { id, __typename }: GetFragmentType): IdValue => {
      return toIdValue(dataIdFromObject({ __typename, id }));
    },
  };
}

export function fragmentLinkState(apolloCache: ApolloCache<any>): ApolloLink {
  return withClientState({
    cache: apolloCache,
    resolvers: {
      Query: {
        getFragment: (
          _: any,
          { __typename, id }: GetFragmentType,
          { cache }: { cache: any },
        ) => {
          const fragmentId = cache.config.dataIdFromObject({ __typename, id });
          return cache.data.data[fragmentId];
        },
      },
    },
  });
}
