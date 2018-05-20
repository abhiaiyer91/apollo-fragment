import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { DocumentNode } from 'graphql';

export function ApolloFragment({ children, fragment, id, typename }: any) {
  const query: DocumentNode = gql`
    query getFragment($id: ID, $__typename: String) {
      getFragment(id: $id, __typename: $__typename) @client {
        ...fragmentFields
      }
    }
    ${fragment}
  `;

  return (
    <Query query={query} variables={{ id, __typename: typename }}>
      {({ data, ...rest }: { data: any }) => {
        return children({ data: (data && data.getFragment) || {}, ...rest });
      }}
    </Query>
  );
}
