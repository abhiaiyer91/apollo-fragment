import { gql } from '@apollo/client/core';
import { DocumentNode, Kind } from 'graphql';

export function getFragmentInfo(fragment: string | DocumentNode) {
  const fragmentAST = typeof fragment === `string` ? gql(fragment) : fragment;
  // ensure we are working with the right kind of definition, otherwise throw warning
  if (
    fragmentAST.definitions &&
    fragmentAST.definitions[0] &&
    fragmentAST.definitions[0].kind === Kind.FRAGMENT_DEFINITION
  ) {
    const fragmentDefinitions =
      fragmentAST.definitions && fragmentAST.definitions[0];
    const fragmentName = fragmentDefinitions && fragmentDefinitions.name.value;
    const fragmentTypeName =
      fragmentDefinitions && fragmentDefinitions.typeCondition.name.value;

    return {
      fragmentName,
      fragmentTypeName,
    };
  } else {
    console.warn(
      `Received fragment with definition kind: ${fragmentAST.definitions[0].kind} but ${Kind.FRAGMENT_DEFINITION} is required`,
    );
  }
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
