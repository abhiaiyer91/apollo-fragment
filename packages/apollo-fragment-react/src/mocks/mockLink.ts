import { graphql, print, ExecutionResult } from 'graphql';
import { ApolloLink, FetchResult, Observable } from '@apollo/client';
import { schema } from './mockSchema';

export default new ApolloLink(operation => {
  return new Observable<FetchResult>(observer => {
    const { query, operationName, variables } = operation;
    delay(300)
      .then(() =>
        graphql(schema, print(query), null, null, variables, operationName),
      )
      .then((result: ExecutionResult) => {
        observer.next(result);
        observer.complete();
      })
      .catch(observer.error.bind(observer));
  });
});

function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
