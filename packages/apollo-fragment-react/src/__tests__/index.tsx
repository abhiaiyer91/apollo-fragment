import * as React from 'react';
import { ApolloClient, InMemoryCache, ApolloLink, gql } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { mount, ReactWrapper } from 'enzyme';
import mockLink from '../mocks/mockLink';
import { fragmentCacheConfig, useApolloFragment } from '../';

type Wrapper = ReactWrapper<any, any> | null;

type FragmentData = {
  id: string;
  name: string;
};

const fragment = `
  fragment fragmentFields on Person {
    id
    name
  }
`;

const createTestClient = () => {
  const cache = new InMemoryCache({
    ...fragmentCacheConfig,
  });

  return new ApolloClient({
    cache,
    link: ApolloLink.from([mockLink]),
  });
};

describe('apollo-fragment-react core behaviour', () => {
  let wrapper: Wrapper;
  beforeEach(() => {
    jest.useRealTimers();
  });

  const client = createTestClient();

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    client.resetStore();
  });

  const PEOPLE_QUERY = gql`
    query peeps {
      people {
        id
        name
      }
    }
  `;

  it('Should return Fragment Data from React Hook', () => {
    return client
      .query({
        query: PEOPLE_QUERY,
      })
      .then(() => {
        let SomeComponent = function Foo() {
          const fragmentData = useApolloFragment<FragmentData>(fragment, '1');
          expect(fragmentData.data.id).toEqual('1');
          expect(fragmentData.data.name).toEqual('John Smith');
          return <p>hi</p>;
        };

        wrapper = mount(
          <ApolloProvider client={client}>
            <SomeComponent />
          </ApolloProvider>,
        );
      });
  });

  it('Should return Fragment Data from React Hook for fragment AST', () => {
    return client
      .query({
        query: PEOPLE_QUERY,
      })
      .then(() => {
        let SomeComponent = function Foo() {
          const fragmentData = useApolloFragment<FragmentData>(
            gql(fragment),
            '1',
          );
          expect(fragmentData.data.id).toEqual('1');
          expect(fragmentData.data.name).toEqual('John Smith');
          return <p>hi</p>;
        };

        wrapper = mount(
          <ApolloProvider client={client}>
            <SomeComponent />
          </ApolloProvider>,
        );
      });
  });
});

describe('apollo-fragment-react completeness check', () => {
  // Mock console.error to catch completeness check messages
  const originalError = console.error;
  let consoleOutput = [];
  const mockedError = output => consoleOutput.push(output);
  beforeEach(() => (console.error = mockedError));
  afterEach(() => {
    console.error = originalError;
    consoleOutput = [];
  });

  let wrapper: Wrapper;
  beforeEach(() => {
    jest.useRealTimers();
  });

  const client = createTestClient();

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    client.resetStore();
  });

  const mountWithApollo = (node: React.ReactNode) =>
    mount(<ApolloProvider client={client}>{node}</ApolloProvider>);

  const INCOMPLETE_QUERY = gql`
    query peeps {
      people {
        id
      }
    }
  `;

  const expectedErrorMessage = `
Unable to resolve fragment fields for Person:1:

  fragment fragmentFields on Person {
    id
    name
  }

Available data:
{
  "id": "1"
}

Make sure that the fields requested in the fragment are fetched by some query`;

  it('Should log error when fragment data is incomplete for hook', () => {
    return client
      .query({
        query: INCOMPLETE_QUERY,
      })
      .then(() => {
        let SomeComponent = function Foo() {
          const fragmentData = useApolloFragment<FragmentData>(fragment, '1');
          expect(fragmentData.data).toBeUndefined();
          return <p>hi</p>;
        };

        wrapper = mountWithApollo(<SomeComponent />);

        expect(consoleOutput[0]).toEqual(expectedErrorMessage);
      });
  });

  it('Should log error when fragment data is incomplete for hook for fragment AST', () => {
    return client
      .query({
        query: INCOMPLETE_QUERY,
      })
      .then(() => {
        let SomeComponent = function Foo() {
          const fragmentData = useApolloFragment<FragmentData>(
            gql(fragment),
            '1',
          );
          expect(fragmentData.data).toBeUndefined();
          return <p>hi</p>;
        };

        wrapper = mountWithApollo(<SomeComponent />);

        expect(consoleOutput[0]).toEqual(expectedErrorMessage);
      });
  });

  it('Should NOT log error when fragment data is empty for hook', () => {
    let SomeComponent = function Foo() {
      const fragmentData = useApolloFragment<FragmentData>(fragment, '1');
      expect(fragmentData.data).toBeUndefined();
      return <p>hi</p>;
    };

    wrapper = mountWithApollo(<SomeComponent />);

    expect(consoleOutput).toHaveLength(0);
  });
});
