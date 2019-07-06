import * as React from 'react';
import gql from 'graphql-tag';
import { ApolloLink, execute, Observable } from 'apollo-link';
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

describe('ApolloFragment component', () => {
  let wrapper: ReactWrapper<any, any> | null;
  beforeEach(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  const cache = new InMemoryCache({
    cacheRedirects: {
      Query: {
        ...fragmentCacheRedirect(),
      },
    },
  });

  const local = fragmentLinkState(cache);

  const client = new ApolloClient({
    cache,
    link: ApolloLink.from([local, mockLink]),
  });

  const fragment = `
    fragment fragmentFields on Person {
      id
      name
    }
  `;

  it('Should return Fragment Data from HOC Component', () => {
    return client
      .query({
        query: gql`
          query peeps {
            people {
              id
              name
            }
          }
        `,
      })
      .then(() => {
        let SomeComponent = function Foo(props) {
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
        query: gql`
          query peeps {
            people {
              id
              name
            }
          }
        `,
      })
      .then(() => {
        let SomeComponent = function Foo(props) {
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
        query: gql`
          query peeps {
            people {
              id
              name
            }
          }
        `,
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
        query: gql`
          query peeps {
            people {
              id
              name
            }
          }
        `,
      })
      .then(() => {
        let SomeComponent = function Foo() {
          const fragmentData = useApolloFragment(fragment, '1');
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
