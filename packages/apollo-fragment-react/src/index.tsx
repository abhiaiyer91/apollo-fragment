import * as React from 'react';
import gql from 'graphql-tag';
import { Query, graphql, useQuery } from 'react-apollo';
import { DocumentNode } from 'graphql';
import { getFragmentInfo, buildFragmentQuery } from 'apollo-fragment-utils';

type FragmentQueryData<TData = any> = {
  getFragment?: TData;
};

export function useApolloFragment<TData = any>(fragment: string, id: string) {
  const { query, typename } = React.useMemo<{
    query: DocumentNode;
    typename: string;
  }>(
    () => {
      const { fragmentTypeName, fragmentName } = getFragmentInfo(fragment);

      return {
        query: buildFragmentQuery({ fragment, fragmentName }),
        typename: fragmentTypeName,
      };
    },
    [fragment],
  );

  const { data, ...rest } = useQuery<FragmentQueryData<TData>>(query, {
    fetchPolicy: 'cache-only',
    variables: {
      id,
      __typename: typename,
    },
  });

  return {
    data: data && data.getFragment,
    ...rest,
  };
}

export function withApolloFragment(
  fragment: string,
  idPropName: string = 'id',
) {
  const { fragmentTypeName, fragmentName } = getFragmentInfo(fragment);
  const query: DocumentNode = buildFragmentQuery({ fragment, fragmentName });
  return graphql<any, any>(query, {
    options: props => {
      return {
        fetchPolicy: 'cache-only',
        variables: {
          id: props[idPropName],
          __typename: fragmentTypeName,
        },
      };
    },
    props: ({ data, ...rest }) => {
      return {
        data: data && data.getFragment,
        ...rest,
      };
    },
  });
}

export function ApolloFragment({ children, fragment, id }: any) {
  const { fragmentTypeName, fragmentName } = getFragmentInfo(fragment);

  const query: DocumentNode = buildFragmentQuery({ fragment, fragmentName });

  return (
    <Query
      fetchPolicy="cache-only"
      query={query}
      variables={{ id, __typename: fragmentTypeName }}
    >
      {({ data, ...rest }: { data: any }) => {
        return children({ data: (data && data.getFragment) || {}, ...rest });
      }}
    </Query>
  );
}
