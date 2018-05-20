import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

export function ApolloFragment({ children, fragment, id, typename }) {
  const query = gql`
    query getFragment($id: ID, $__typename: String) {
      getFragment(id: $id, __typename: $__typename) @client {
        ...fragmentFields
      }
    }
    ${fragment}
  `;

  return (
    <Query
      query={query}
      cachePolicy="no-fetch"
      variables={{ id, __typename: typename }}
    >
      {({ data, ...rest }) => {
        return children({ data: (data && data.getFragment) || {}, ...rest });
      }}
    </Query>
  );
}
