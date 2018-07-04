import CApolloFragment from './ApolloFragment';

function install(Vue) {
  Vue.component('apollo-fragment', CApolloFragment);
  Vue.component('ApolloFragment', CApolloFragment);
}

CApolloFragment.install = install;

// Components
export default CApolloFragment;
