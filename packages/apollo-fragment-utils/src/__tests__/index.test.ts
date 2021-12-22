import { gql } from '@apollo/client/core';
import { getFragmentInfo, buildFragmentQuery } from '../';

describe('getFragmentInfo', () => {
  it('should return correct fragment name and typename for string fragments', () => {
    const fragment = `
            fragment testFragment on Person {
                name
                avatar
            }
        `;

    const fragmentInfo = getFragmentInfo(fragment);

    expect(fragmentInfo.fragmentName).toBe('testFragment');
    expect(fragmentInfo.fragmentTypeName).toBe('Person');
  });

  it('should return correct fragment name and typename for fragments parsed into GraphQL AST', () => {
    const fragment = gql`
      fragment testFragment on Person {
        name
        avatar
      }
    `;

    const fragmentInfo = getFragmentInfo(fragment);

    expect(fragmentInfo.fragmentName).toBe('testFragment');
    expect(fragmentInfo.fragmentTypeName).toBe('Person');
  });
});

describe('buildFragmentQuery', () => {
  const expectedQuery = gql`
    query getFragment($id: ID, $__typename: String) {
      getFragment(id: $id, __typename: $__typename) @client {
        ...testFragment
      }
    }

    fragment testFragment on Person {
      name
      avatar
    }
  `;

  it('should return a valid query based on a string fragment', () => {
    const fragment = `
            fragment testFragment on Person {
                name
                avatar
            }
        `;

    const fragmentQuery = buildFragmentQuery({
      fragment,
      fragmentName: `testFragment`,
    });

    expect(fragmentQuery).toEqual(expectedQuery);
  });

  it('should return a valid query based on a fragment parsed into GraphQL AST', () => {
    const fragment = gql`
      fragment testFragment on Person {
        name
        avatar
      }
    `;

    const fragmentQuery = buildFragmentQuery({
      fragment,
      fragmentName: `testFragment`,
    });

    expect(fragmentQuery).toEqual(expectedQuery);
  });
});
