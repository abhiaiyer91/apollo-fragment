import './index.css';

import React from 'react';
import { render } from 'react-dom';
import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { toIdValue } from 'apollo-utilities';
import { withClientState } from 'apollo-link-state';
import { link } from './graphql/link';
import App from './App';

const cache = new InMemoryCache({
  cacheRedirects: {
    Query: {
      getFragment: (_, { id, __typename }) => {
        return toIdValue(cache.config.dataIdFromObject({ __typename, id }));
      },
    },
  },
});

const stateLink = withClientState({
  cache,
  resolvers: {
    Query: {
      getFragment: (_, { __typename, id }, { cache }) => {
        const fragmentId = cache.config.dataIdFromObject({ __typename, id });
        return cache.data.data[fragmentId];
      },
    },
  },
});

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([stateLink, link]),
});

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);
