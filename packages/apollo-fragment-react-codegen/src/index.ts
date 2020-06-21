import {
  Types,
  PluginValidateFn,
  PluginFunction,
} from '@graphql-codegen/plugin-helpers';
import {
  GraphQLSchema,
  concatAST,
  Kind,
  FragmentDefinitionNode,
} from 'graphql';
import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { ApolloFragmentReactVisitor } from './visitor';
import { extname } from 'path';
import { ApolloFragmentReactRawPluginConfig } from './config';

export const plugin: PluginFunction<
  ApolloFragmentReactRawPluginConfig,
  Types.ComplexPluginOutput
> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: ApolloFragmentReactRawPluginConfig,
) => {
  const allAst = concatAST(documents.map(v => v.document));

  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(
      d => d.kind === Kind.FRAGMENT_DEFINITION,
    ) as FragmentDefinitionNode[]).map(fragmentDef => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false,
    })),
    ...(config.externalFragments || []),
  ];

  const visitor = new ApolloFragmentReactVisitor(
    schema,
    allFragments,
    config,
    documents,
  );

  return {
    prepend: visitor.getImports(),
    content: visitor.fragments,
  };
};

export const validate: PluginValidateFn<any> = async (
  _schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  _config: ApolloFragmentReactRawPluginConfig,
  outputFile: string,
) => {
  if (extname(outputFile) !== '.ts' && extname(outputFile) !== '.tsx') {
    throw new Error(
      `Plugin "apollo-fragment-react-codegen" requires extension to be ".ts" or ".tsx"!`,
    );
  }
};

export { ApolloFragmentReactVisitor };
