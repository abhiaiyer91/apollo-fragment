import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { ApolloFragment } from 'apollo-fragment-react';

const fragment = `
  fragment fragmentFields on Person {
    id
    name
    __typename
  }
`;

let ListView = function ListView({ data: { loading, people } }) {
  return (
    <section>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul>
          {people &&
            people.map(person => <li key={person.id}>{person.name}</li>)}
        </ul>
      )}
    </section>
  );
};

ListView = graphql(
  gql`
    query peeps {
      people {
        id
        name
      }
    }
  `,
)(ListView);

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      showView: false,
    };
  }
  render() {
    const { showView } = this.state;

    return (
      <main>
        <header>
          <h1>ApolloFragment</h1>
        </header>

        <ApolloFragment id="1" typename="Person" fragment={fragment}>
          {({ data }) => {
            return (
              <section>
                <p>
                  This component is "watching" a fragment, it will render the
                  persons name once the list view renders
                </p>
                <p>{data && `Person Name: ${data.name || ''}`}</p>
              </section>
            );
          }}
        </ApolloFragment>
        <br />
        <br />
        <br />

        {showView && <ListView />}

        <button
          onClick={() => {
            return this.setState({ showView: !showView });
          }}
        >
          {showView ? 'Hide' : 'Show'} List View
        </button>
      </main>
    );
  }
}
