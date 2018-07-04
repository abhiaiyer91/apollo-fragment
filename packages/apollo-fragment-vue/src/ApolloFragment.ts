import { ApolloQuery } from 'vue-apollo';
import { getFragmentInfo, buildFragmentQuery } from 'apollo-fragment-utils';

function isDataFilled(data) {
  return Object.keys(data).length > 0;
}

interface resultData {
  getFragment: any;
}

export default {
  ...ApolloQuery,
  name: 'ApolloFragment',
  props: {
    fragment: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: 'div',
    },
  },
  data(props) {
    const { id, fragment } = this.$options.propsData;
    const { fragmentTypeName, fragmentName } = getFragmentInfo(fragment);
    const query = buildFragmentQuery({ fragment, fragmentName });

    return {
      ...ApolloQuery.data(),
      query,
      variables: {
        id,
        __typename: fragmentTypeName,
      },
    };
  },
  apollo: {
    $client() {
      return this.clientId;
    },
    query() {
      return {
        ...ApolloQuery.apollo.query(),
        query() {
          return this.$data.query;
        },
        variables() {
          return this.$data.variables;
        },
        skip: false,
        fetchPolicy: 'cache-only',
        result(result) {
          const { errors, loading, networkStatus } = result;
          let { error } = result;
          result = Object.assign({}, result);

          if (errors && errors.length) {
            error = new Error(`Apollo errors occured (${errors.length})`);
            error.graphQLErrors = errors;
          }

          let data = {} as resultData;

          if (loading) {
            Object.assign(data, this.$_previousData, result.data);
          } else if (error) {
            Object.assign(
              data,
              this.$apollo.queries.query.observer.getLastResult() || {},
              result.data,
            );
          } else {
            data = result.data;
            this.$_previousData = result.data;
          }

          this.result = {
            data: isDataFilled(data) ? data.getFragment : undefined,
            loading,
            error,
            networkStatus,
          };

          this.times = ++this.$_times;

          this.$emit('result', this.result);
        },
        error(error) {
          this.result.loading = false;
          this.result.error = error;
          this.$emit('error', error);
        },
      };
    },
  },
};
