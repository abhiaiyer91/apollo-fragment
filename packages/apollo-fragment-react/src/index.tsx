import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { DocumentNode } from 'graphql';

export function ApolloFragment({ children, fragment, id }: any) {
  const fragmentAST = gql(fragment);
  const fragmentDefinitions =
    fragmentAST.definitions && fragmentAST.definitions[0];
  const fragmentName = fragmentDefinitions && fragmentDefinitions.name.value;
  const fragmentTypeName =
    fragmentDefinitions && fragmentDefinitions.typeCondition.name.value;

  const query: DocumentNode = gql`
    query getFragment($id: ID, $__typename: String) {
      getFragment(id: $id, __typename: $__typename) @client {
        ...${fragmentName}
      }
    }
    ${fragment}
  `;

  return (
    <Query query={query} variables={{ id, __typename: fragmentTypeName }}>
      {({ data, ...rest }: { data: any }) => {
        return children({ data: (data && data.getFragment) || {}, ...rest });
      }}
    </Query>
  );
}
