import * as React from 'react';
import gql from 'graphql-tag';
import { Query, graphql } from 'react-apollo';
import { DocumentNode } from 'graphql';

function getFragmentInfo(fragment: string) {
  const fragmentAST = gql(fragment);
  const fragmentDefinitions =
    fragmentAST.definitions && fragmentAST.definitions[0];
  const fragmentName = fragmentDefinitions && fragmentDefinitions.name.value;
  const fragmentTypeName =
    fragmentDefinitions && fragmentDefinitions.typeCondition.name.value;

  return {
    fragmentName,
    fragmentTypeName,
  };
}

export type buildFragmentQueryType = {
  fragment: string;
  fragmentName: string;
};

function buildFragmentQuery({
  fragment,
  fragmentName,
}: buildFragmentQueryType): DocumentNode {
  return gql`
    query getFragment($id: ID, $__typename: String) {
      getFragment(id: $id, __typename: $__typename) @client {
        ...${fragmentName}
      }
    }
    ${fragment}
  `;
}

export function withApolloFragment(fragment: string) {
  const { fragmentTypeName, fragmentName } = getFragmentInfo(fragment);
  const query: DocumentNode = buildFragmentQuery({ fragment, fragmentName });
  return graphql<any, any>(query, {
    options: ({ id }) => {
      return {
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
    <Query query={query} variables={{ id, __typename: fragmentTypeName }}>
      {({ data, ...rest }: { data: any }) => {
        return children({ data: (data && data.getFragment) || {}, ...rest });
      }}
    </Query>
  );
}
