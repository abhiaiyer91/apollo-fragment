# Apollo Fragment

Apollo Fragment holds two libraries aimed at connecting UI components to GraphQL
fragments in the Apollo Cache.

`apollo-link-state-fragment` exposes a `cacheRedirect` and `withClientState`
configuration for querying fragments from the cache.

`apollo-fragment-react` exposes an `ApolloFragment` query component that will
connect your component to a fragment in cache and automatically watch all
changes to it.

## Installation

It is simple to add to your current apollo client setup:

```bash
# installing cache addons and react packahe
yarn add apollo-link-state-fragment apollo-fragment-react -S
```

## Usage

To get started you will want to add the `fragmentCacheRedirect` to your
`InMemoryCache` cacheRedirect map.

```js
import { InMemoryCache } from "apollo-cache-inmemory";
import { fragmentCacheRedirect } from "apollo-link-state-fragment";

const cache = new InMemoryCache({
  cacheRedirects: {
    Query: {
      ...fragmentCacheRedirect()
    }
  }
});
```

Next, import the `fragmentLinkState` and pass in the cache.

```js
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import {
  fragmentCacheRedirect,
  fragmentLinkState
} from "apollo-link-state-fragment";

const cache = new InMemoryCache({
  cacheRedirects: {
    Query: {
      ...fragmentCacheRedirect()
    }
  }
});

const client = new ApolloClient({
  link: ApolloLink.from([fragmentLinkState(cache), new HttpLink()]),
  cache: new InMemoryCache()
});
```

Once you have your client setup to make these kind of queries against the cache,
we can now use the React integration: All we have to do is pass the id of the
fragment you're looking for, and the selection set in a named
fragment.

```js
import { ApolloFragment } from "apollo-fragment-react";

const fragment = `
  fragment fragmentFields on Person {
    idea
    name
    __typename
  }
`;

function App() {
  return (
    <section>
      <ApolloFragment id="1" fragment={fragment}>
        {({ data }) => {
          return (
            <section>
              <p>
                This component is "watching" a fragment in the cache, it will
                render the persons name once the data enters
              </p>
              <p>{data && `Person Name: ${data.name || ""}`}</p>
            </section>
          );
        }}
      </ApolloFragment>

      <button
        onClick={function() {
          client.query({
            query: gql`
              query peeps {
                people {
                  id
                  name
                }
              }
            `
          });
        }}
      >
        Click to load people
      </button>
    </section>
  );
}
```

In our example above, We have used the `ApolloFragment` query component to bind the current value of the fragment in cache. When a user clicks to load a list of people, our component subscribed to a user with id "1", will rerender and display the person's name.
