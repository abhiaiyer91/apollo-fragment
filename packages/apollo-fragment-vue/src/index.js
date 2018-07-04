import Vue from 'vue';
import CApolloFragment from './ApolloFragment';

function install() {
  if (install.installed) {
    return;
  }

  install.installed = true;

  const vueVersion = Vue.version.substr(0, Vue.version.indexOf('.'));

  if (vueVersion === '2') {
    Vue.component('apollo-fragment', CApolloFragment);
    Vue.component('ApolloFragment', CApolloFragment);
  }
}

CApolloFragment.install = install;

// Auto-install
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(apolloProvider);
}

// Components
export default CApolloFragment;
