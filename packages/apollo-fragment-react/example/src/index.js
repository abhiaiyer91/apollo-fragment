import './index.css';

import React from 'react';
import { render } from 'react-dom';
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  ApolloLink,
} from '@apollo/client';
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
