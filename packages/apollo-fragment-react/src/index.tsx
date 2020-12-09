import * as React from 'react';
import { ApolloClient, InMemoryCacheConfig } from '@apollo/client';
import { useQuery, QueryResult } from '@apollo/client/react';
import { DocumentNode, Location } from 'graphql';
import { getFragmentInfo, buildFragmentQuery } from 'apollo-fragment-utils';

type FragmentQueryData<TData = any> = {
  getFragment?: TData;
};

export type SupportedFragment = DocumentNode | string;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type ApolloFragmentResult<TData = any> = Omit<
  QueryResult<FragmentQueryData<TData>>,
  'data'
> & {
  data: TData | undefined;
};

export function useApolloFragment<TData = any>(
  fragment: SupportedFragment,
  id: string,
): ApolloFragmentResult<TData> {
  const fragmentQuery = React.useMemo(() => createFragmentQuery(fragment), [
    fragment,
  ]);

  const { data, client, ...rest } = useQuery<FragmentQueryData<TData>>(
    fragmentQuery.query,
    {
      fetchPolicy: 'cache-only',
      variables: {
        id,
        __typename: fragmentQuery.fragmentTypeName,
      },
    },
  );

  const fragmentData = data && data.getFragment;

  if (!fragmentData) {
    checkDataCompleteness({
      fragmentQuery,
      id,
      client,
    });
  }

  return {
    data: fragmentData,
    client,
    ...rest,
  };
}

export const fragmentCacheConfig: Required<Pick<
  InMemoryCacheConfig,
  'typePolicies'
>> = {
  typePolicies: {
    Query: {
      fields: {
        getFragment(_, { args, toReference }) {
          return toReference({
            id: args ? args.id : undefined,
            __typename: args ? args.__typename : undefined,
          });
        },
      },
    },
  },
};

type FragmentQuery = {
  query: DocumentNode;
  fragmentTypeName: string;
  fragmentSource: string;
};

function createFragmentQuery(fragment: SupportedFragment): FragmentQuery {
  const { fragmentTypeName, fragmentName } = getFragmentInfo(fragment);

  return {
    query: buildFragmentQuery({ fragment, fragmentName }),
    fragmentTypeName: fragmentTypeName,
    fragmentSource:
      typeof fragment === `string`
        ? fragment
        : (fragment.loc as Location).source.body,
  };
}

function checkDataCompleteness({
  fragmentQuery,
  id,
  client,
}: {
  fragmentQuery: FragmentQuery;
  id: string;
  client: ApolloClient<any>;
}): void {
  // Only perform completeness check for non-production code
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const diff = client.cache.diff<any>({
    query: fragmentQuery.query,
    variables: {
      id,
      __typename: fragmentQuery.fragmentTypeName,
    },
    previousResult: undefined,
    optimistic: true,
  });

  if (diff.complete === true) {
    return;
  }

  const fragmentData = diff.result && diff.result.getFragment;
  const noData = Object.keys(fragmentData || {}).length === 0;

  if (noData) {
    return;
  }
  const dataWithoutTypename = { ...fragmentData, __typename: undefined };

  const errorMessage = `
Unable to resolve fragment fields for ${fragmentQuery.fragmentTypeName}:${id}:
${fragmentQuery.fragmentSource.trimRight()}

Available data:
${JSON.stringify(dataWithoutTypename, null, 2)}

Make sure that the fields requested in the fragment are fetched by some query`;

  console.error(errorMessage);
}
