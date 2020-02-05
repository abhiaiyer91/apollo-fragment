import * as React from 'react';
import gql from 'graphql-tag';
import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { mount, ReactWrapper } from 'enzyme';
import mockLink from '../mocks/mockLink';
import {
  fragmentCacheRedirect,
  fragmentLinkState,
} from '../../../apollo-link-state-fragment/src';
import { ApolloFragment, withApolloFragment, useApolloFragment } from '../';

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
    cacheRedirects: {
      Query: {
        ...fragmentCacheRedirect(),
      },
    },
  });

  const local = fragmentLinkState(cache);

  return new ApolloClient({
    cache,
    link: ApolloLink.from([local, mockLink]),
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

  it('Should return Fragment Data from HOC Component', () => {
    return client
      .query({
        query: PEOPLE_QUERY,
      })
      .then(() => {
        let SomeComponent: React.ComponentType<any> = function Foo(props) {
          expect(props.data.id).toEqual('1');
          expect(props.data.name).toEqual('John Smith');
          return <p>hi</p>;
        };

        SomeComponent = withApolloFragment(fragment)(SomeComponent);

        wrapper = mount(
          <ApolloProvider client={client}>
            <SomeComponent id="1" />
          </ApolloProvider>,
        );
      });
  });

  it('Should return Fragment Data from HOC Component with custom "id"', () => {
    return client
      .query({
        query: PEOPLE_QUERY,
      })
      .then(() => {
        let SomeComponent: React.ComponentType<any> = function Foo(props) {
          expect(props.data.id).toEqual('1');
          expect(props.data.name).toEqual('John Smith');
          return <p>hi</p>;
        };

        SomeComponent = withApolloFragment(fragment, 'fragmentId')(
          SomeComponent,
        );

        wrapper = mount(
          <ApolloProvider client={client}>
            <SomeComponent fragmentId="1" />
          </ApolloProvider>,
        );
      });
  });

  it('Should return Fragment Data from Render Prop Component', () => {
    return client
      .query({
        query: PEOPLE_QUERY,
      })
      .then(() => {
        wrapper = mount(
          <ApolloProvider client={client}>
            <ApolloFragment fragment={fragment} id="1">
              {(result: any) => {
                expect(result.data.id).toEqual('1');
                expect(result.data.name).toEqual('John Smith');
                return <p>hi</p>;
              }}
            </ApolloFragment>
          </ApolloProvider>,
        );
      });
  });

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

  it('Should log error when fragment data is incomplete for HOC Component', () => {
    return client
      .query({
        query: INCOMPLETE_QUERY,
      })
      .then(() => {
        let SomeComponent: React.ComponentType<any> = function Foo(props) {
          expect(props.data).toBeUndefined();
          return <p>hi</p>;
        };

        SomeComponent = withApolloFragment(fragment)(SomeComponent);

        wrapper = mountWithApollo(<SomeComponent id="1" />);

        expect(consoleOutput[0]).toEqual(expectedErrorMessage);
      });
  });

  it('Should log error when fragment data is incomplete for HOC Component with custom "id"', () => {
    return client
      .query({
        query: INCOMPLETE_QUERY,
      })
      .then(() => {
        let SomeComponent: React.ComponentType<any> = function Foo(props) {
          expect(props.data).toBeUndefined();
          return <p>hi</p>;
        };

        SomeComponent = withApolloFragment(fragment, 'fragmentId')(
          SomeComponent,
        );

        wrapper = mountWithApollo(<SomeComponent fragmentId="1" />);

        expect(consoleOutput[0]).toEqual(expectedErrorMessage);
      });
  });

  it('Should log error when fragment data is incomplete for Render Prop Component', () => {
    return client
      .query({
        query: INCOMPLETE_QUERY,
      })
      .then(() => {
        wrapper = mountWithApollo(
          <ApolloFragment fragment={fragment} id="1">
            {(result: any) => {
              expect(result.data).toEqual({});
              return <p>hi</p>;
            }}
          </ApolloFragment>,
        );
        expect(consoleOutput[0]).toEqual(expectedErrorMessage);
      });
  });

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

  it('Should NOT log error when fragment data is empty for HOC Component', () => {
    let SomeComponent: React.ComponentType<any> = function Foo(props) {
      expect(props.data).toBeUndefined();
      return <p>hi</p>;
    };

    SomeComponent = withApolloFragment(fragment)(SomeComponent);

    wrapper = mountWithApollo(<SomeComponent id="1" />);

    expect(consoleOutput).toHaveLength(0);
  });

  it('Should NOT log error when fragment data is empty for HOC Component with custom "id"', () => {
    let SomeComponent: React.ComponentType<any> = function Foo(props) {
      expect(props.data).toBeUndefined();
      return <p>hi</p>;
    };

    SomeComponent = withApolloFragment(fragment, 'fragmentId')(SomeComponent);

    wrapper = mountWithApollo(<SomeComponent fragmentId="1" />);

    expect(consoleOutput).toHaveLength(0);
  });

  it('Should NOT log error when fragment data is empty for Render Prop Component', () => {
    wrapper = mountWithApollo(
      <ApolloFragment fragment={fragment} id="1">
        {(result: any) => {
          expect(result.data).toEqual({});
          return <p>hi</p>;
        }}
      </ApolloFragment>,
    );
    expect(consoleOutput).toHaveLength(0);
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
