# Apollo Fragment

Apollo Fragment holds libraries aimed at connecting UI components to GraphQL
fragments in the Apollo Cache.

`apollo-link-state-fragment` exposes a `cacheRedirect` and `withClientState`
configuration for querying fragments from the cache.

`apollo-fragment-react` exposes an `ApolloFragment` query component that will
connect your component to a fragment in cache and automatically watch all
changes to it.

`apollo-fragment-vue` exposes an `ApolloFragment` Vue component that will
connect your component to a fragment in cache and automatically watch all
changes to it.

## Background

Read about this library here: https://medium.com/open-graphql/fragment-driven-uis-with-apollo-17d933fa1cbe

## React

<p>
  <a href="https://www.npmjs.com/package/apollo-fragment-react">
    <img src="https://img.shields.io/npm/dt/apollo-fragment-react.svg" alt="Npm download">
  </a>
</p>

## Vue

<p>
  <a href="https://www.npmjs.com/package/apollo-fragment-vue">
    <img src="https://img.shields.io/npm/dt/apollo-fragment-vue.svg" alt="Npm download">
  </a>
</p>

## Link State

<p>
  <a href="https://www.npmjs.com/package/apollo-link-state-fragment">
    <img src="https://img.shields.io/npm/dt/apollo-link-state-fragment.svg" alt="Npm download">
  </a>
</p>

## Installation

It is simple to add to your current apollo client setup:

```bash
# installing cache addons and react package
yarn add apollo-link-state-fragment apollo-fragment-react -S
```

or

```bash
# installing cache addons and react package
yarn add apollo-link-state-fragment apollo-fragment-vue -S
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
      ...fragmentCacheRedirect(),
    },
  },
});
```

Next, import the `fragmentLinkState` and pass in the cache.

```js
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import {
  fragmentCacheRedirect,
  fragmentLinkState,
} from "apollo-link-state-fragment";

const cache = new InMemoryCache({
  cacheRedirects: {
    Query: {
      ...fragmentCacheRedirect(),
    },
  },
});

const client = new ApolloClient({
  link: ApolloLink.from([fragmentLinkState(cache), new HttpLink()]),
  cache: new InMemoryCache(),
});
```

Once you have your client setup to make these kind of queries against the cache,
we can now use the View layer integrations: All we have to do is pass the id of
the fragment you're looking for, and the selection set in a named fragment.

## React

```jsx
import { useApolloFragment } from "apollo-fragment-react";

const fragment = `
  fragment fragmentFields on Person {
    idea
    name
    __typename
  }
`;

function App() {
  const { data } = useApolloFragment(fragment, "1");

  return (
    <section>
      <p>
        This component is "watching" a fragment in the cache, it will render the
        persons name once the data enters
      </p>
      <p>{data && `Person Name: ${data.name || ""}`}</p>

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
            `,
          });
        }}
      >
        Click to load people
      </button>
    </section>
  );
}
```

## Vue

```html
<template>
  <div>
    <p>
      This list is created by calling a GraphQL Fragment with ApolloFragment
    </p>
    <ApolloFragment :fragment="fragment" :id="id">
      <template slot-scope="{ result: { loading, error, data } }">
        <div v-if="loading" class="loading apollo">Loading...</div>

        <!-- Error -->
        <div v-else-if="error" class="error apollo">An error occured</div>

        <!-- Result -->
        <div v-else-if="data" class="result apollo">
          <p>ID: {{data.id}} - {{data.name}}</p>
        </div>

        <!-- No result -->
        <div v-else class="no-result apollo">
          <p>No result :(</p>
        </div>
      </template>
    </ApolloFragment>
  </div>
</template>

<script>
  const fragment = `
  fragment fragmentFields on Person {
    idea
    name
    __typename
  }
`;

  export default {
    name: "Example",
    data() {
      return {
        id: "1",
        fragment,
      };
    },
  };
</script>
```

In our examples above, We have used the `ApolloFragment` query component to bind
the current value of the fragment in cache. When a user clicks to load a list of
people, our component subscribed to a user with id "1", will rerender and
display the person's name.
