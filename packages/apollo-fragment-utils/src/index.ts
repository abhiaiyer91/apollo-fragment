import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

export function getFragmentInfo(fragment: string | DocumentNode) {
  const fragmentAST = typeof fragment === `string` ? gql(fragment) : fragment;
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
  fragment: string | DocumentNode;
  fragmentName: string;
};

export function buildFragmentQuery({
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
