import * as React from 'react';
import gql from 'graphql-tag';
import { Query, graphql } from 'react-apollo';
import { DocumentNode } from 'graphql';
import { getFragmentInfo, buildFragmentQuery } from 'apollo-fragment-utils';

export function withApolloFragment(fragment: string) {
  const { fragmentTypeName, fragmentName } = getFragmentInfo(fragment);
  const query: DocumentNode = buildFragmentQuery({ fragment, fragmentName });
  return graphql<any, any>(query, {
    options: ({ id }) => {
      return {
        fetchPolicy: 'cache-only',
        variables: {
          id,
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
