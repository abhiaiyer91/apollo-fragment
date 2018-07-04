<template>
  <div class="hello">
    <h1>{{ msg }}</h1>


    <ApolloQuery
      :query="query"
    >
      <template slot-scope="{ result: { loading, error, data } }">
        <!-- Loading -->
        <div v-if="loading" class="loading apollo">Loading...</div>

        <!-- Error -->
        <div v-else-if="error" class="error apollo">An error occured</div>

        <!-- Result -->
        <div v-else-if="data" class="result apollo">
          <p>This list is created by calling a GraphQL Query with ApolloQuery</p>
          <div v-for="people in data.people">
            <p>ID: {{people.id}} - {{people.name}}</p>
          </div>
        </div>

        <!-- No result -->
        <div v-else class="no-result apollo">No result :(</div>
      </template>
    </ApolloQuery>

    <p>This list is created by calling a GraphQL Fragment with ApolloFragment</p>
    <ApolloFragment
      :fragment="fragment"
      :id="id"
    >
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
import gql from "graphql-tag";
import fragment from "../graphql/personFragment.js";

export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  data(props) {
    return {
      id: "1",
      fragment,
      query: gql`
        query peeps {
          people {
            id
            name
          }
        }
      `
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
