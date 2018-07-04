import './index.css';

import React from 'react';
import { render } from 'react-dom';
import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import {
  fragmentCacheRedirect,
  fragmentLinkState,
} from 'apollo-link-state-fragment';
import { link } from './graphql/link';
import App from './App';

const cache = new InMemoryCache({
  cacheRedirects: {
    Query: {
      ...fragmentCacheRedirect(),
    },
  },
});

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([fragmentLinkState(cache), link]),
});

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);
