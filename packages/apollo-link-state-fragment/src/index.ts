import {
  defaultDataIdFromObject,
  ApolloLink,
  ApolloCache,
  ApolloClient,
} from '@apollo/client';
import { toIdValue, IdValue } from '@apollo/client/utilities';

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
  return new ApolloClient({
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
