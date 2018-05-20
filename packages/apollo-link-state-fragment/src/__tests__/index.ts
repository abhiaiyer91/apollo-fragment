import gql from "graphql-tag";
import { ApolloLink, execute, Observable } from "apollo-link";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import mockLink from "../mocks/mockLink";
import { fragmentCacheRedirect, fragmentLinkState } from "../";

describe("Basic Usage", () => {
  it("Will return null when fragment data is missing from cache", () => {
    const query = gql`
      {
        getFragment(id: 1, __typename: "Person") @client {
          id
          name
        }
      }
    `;

    const cache = new InMemoryCache({
      cacheRedirects: {
        Query: {
          ...fragmentCacheRedirect(cache)
        }
      }
    });

    const local = fragmentLinkState(cache);

    const client = new ApolloClient({
      cache,
      link: ApolloLink.from([local, mockLink])
    });

    return client.query({ query }).then(({ data }) => {
      console.log(data);
      expect(data).toEqual(null);
    });
  });

  it("Will return fragment data once in cache", function () {
    const query = gql`
      {
        getFragment(id: 1, __typename: "Person") @client {
          id
          name
        }
      }
    `;

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

    return client.query({
      query: gql`
        query peeps {
          people {
            id
            name
          }
        }
      `
    }).then((result) => {
      return client.query({ query }).then(({ data }) => {
        expect(data.getFragment.id).toEqual('1');
      });
    });
  });
});
