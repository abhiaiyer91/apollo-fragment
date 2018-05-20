import * as React from "react";
import gql from "graphql-tag";
import { ApolloLink, execute, Observable } from "apollo-link";
import { ApolloClient } from "apollo-client";
import { ApolloProvider } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";
import { mount, ReactWrapper } from "enzyme";
import mockLink from "../mocks/mockLink";
import {
  fragmentCacheRedirect,
  fragmentLinkState
} from "../../../apollo-link-state-fragment/src";
import { ApolloFragment } from "../";

describe("ApolloFragment component", () => {
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

  it("Should return Fragment Data", () => {
    const cache = new InMemoryCache({
      cacheRedirects: {
        Query: {
          ...fragmentCacheRedirect()
        }
      }
    });

    const local = fragmentLinkState(cache);

    const client = new ApolloClient({
      cache,
      link: ApolloLink.from([local, mockLink])
    });

    const fragment = `
      fragment fragmentFields on Person {
        id
        name
      }
    `;

    return client
      .query({
        query: gql`
          query peeps {
            people {
              id
              name
            }
          }
        `
      })
      .then(({ data }) => {
        wrapper = mount(
          <ApolloProvider client={client}>
            <ApolloFragment fragment={fragment} id="1" typename="Person">
              {result => {
                expect(result.data.id).toEqual('1');
                expect(result.data.name).toEqual('John Smith');
                return <p>hi</p>;
              }}
            </ApolloFragment>
          </ApolloProvider>
        );
      });
  });
});
