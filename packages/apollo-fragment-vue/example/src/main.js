import Vue from 'vue';
import App from './App.vue';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import VueApollo from 'vue-apollo';
import {
  fragmentCacheRedirect,
  fragmentLinkState,
} from 'apollo-link-state-fragment';
import ApolloFragment from '../../src';
import { link } from './graphql/link';

Vue.config.productionTip = false;

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

// Install the vue plugin
Vue.use(VueApollo);
Vue.use(ApolloFragment);

const apolloProvider = new VueApollo({
  defaultClient: client,
});

new Vue({
  render: h => h(App),
  provide: apolloProvider.provide(),
}).$mount('#app');
