import * as React from 'react';
import {
  Query,
  graphql,
  useQuery,
  withApollo,
  QueryResult,
} from 'react-apollo';
import { DocumentNode } from 'graphql';
import { getFragmentInfo, buildFragmentQuery } from 'apollo-fragment-utils';
import ApolloClient from 'apollo-client';
// compose-tiny doesn't have a default export, so we have to use `* as`
// However, rollup creates a synthetic default module, so we have to to import it with `default as`.
import * as _compose from 'compose-tiny';
// @ts-ignore
import { default as _rollupCompose } from 'compose-tiny';

const compose = _rollupCompose || _compose;

type FragmentQueryData<TData = any> = {
  getFragment?: TData;
};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type ApolloFragmentResult<TData = any> = Omit<
  QueryResult<FragmentQueryData<TData>>,
  'data'
> & {
  data: TData | undefined;
};

export function useApolloFragment<TData = any>(
  fragment: string,
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

export function withApolloFragment(
  fragment: string,
  idPropName: string = 'id',
) {
  const fragmentQuery = createFragmentQuery(fragment);
  return compose(
    withApollo,
    graphql<any, any>(fragmentQuery.query, {
      options: props => {
        return {
          fetchPolicy: 'cache-only',
          variables: {
            id: props[idPropName],
            __typename: fragmentQuery.fragmentTypeName,
          },
        };
      },
      props: ({ data, ownProps: { client, ...ownProps }, ...rest }) => {
        const fragmentData = data && data.getFragment;

        if (!fragmentData) {
          checkDataCompleteness({
            fragmentQuery,
            id: ownProps[idPropName],
            client,
          });
        }

        return {
          data: fragmentData,
          ownProps,
          ...rest,
        };
      },
    }),
  );
}

type ApolloFragmentChildrenData<TData = any> = Omit<
  ApolloFragmentResult<TData>,
  'data'
> & { data: ApolloFragmentResult<TData>['data'] | {} };

export type ApolloFragmentProps<TData = any> = {
  id: string;
  fragment: string;
  children: (
    fragmentQueryResult: ApolloFragmentChildrenData<TData>,
  ) => React.ReactElement;
};

export function ApolloFragment<TData = any>({
  children,
  fragment,
  id,
}: ApolloFragmentProps<TData>) {
  const fragmentQuery = createFragmentQuery(fragment);

  return (
    <Query<FragmentQueryData<TData>>
      fetchPolicy="cache-only"
      query={fragmentQuery.query}
      variables={{ id, __typename: fragmentQuery.fragmentTypeName }}
    >
      {({ data, client, ...rest }) => {
        const fragmentData = data && data.getFragment;

        if (!fragmentData) {
          checkDataCompleteness({
            fragmentQuery,
            id,
            client,
          });
        }

        return children({ data: fragmentData || {}, client, ...rest });
      }}
    </Query>
  );
}

type FragmentQuery = {
  query: DocumentNode;
  fragmentTypeName: string;
  fragmentSource: string;
};

function createFragmentQuery(fragment: string): FragmentQuery {
  const { fragmentTypeName, fragmentName } = getFragmentInfo(fragment);

  return {
    query: buildFragmentQuery({ fragment, fragmentName }),
    fragmentTypeName: fragmentTypeName,
    fragmentSource: fragment,
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
