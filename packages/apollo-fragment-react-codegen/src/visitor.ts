import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  getConfigValue,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import { ApolloFragmentReactRawPluginConfig } from './config';
import autoBind from 'auto-bind';
import { GraphQLSchema, FragmentDefinitionNode } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { pascalCase } from 'pascal-case';

export interface ReactApolloPluginConfig extends ClientSideBasePluginConfig {
  apolloFragmentReactImportFrom: string;
  withResultType: boolean;
  addDocBlocks: boolean;
}

export class ApolloFragmentReactVisitor extends ClientSideBaseVisitor<
  ApolloFragmentReactRawPluginConfig,
  ReactApolloPluginConfig
> {
  imports: Set<string>;

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: ApolloFragmentReactRawPluginConfig,
    documents: Types.DocumentFile[],
  ) {
    super(schema, fragments, rawConfig, {
      apolloFragmentReactImportFrom: getConfigValue(
        rawConfig.apolloFragmentReactImportFrom,
        `apollo-fragment-react`,
      ),
      addDocBlocks: getConfigValue(rawConfig.addDocBlocks, true),
    });

    this._documents = documents;
    this.imports = new Set();

    autoBind(this);
  }

  public getImports(): string[] {
    const baseImports = super.getImports();

    if (!this.fragments) {
      return baseImports;
    }

    return [...baseImports, ...this.imports];
  }

  protected _generateFragment(fragmentDocument: FragmentDefinitionNode) {
    this.imports.add(this.getApolloFragmentReactImport());
    const hooks = this._buildHooks(fragmentDocument);

    return [hooks, ''].filter(a => a).join('\n');
  }

  private getApolloFragmentReactImport(): string {
    return `import { useApolloFragment } from '${this.config.apolloFragmentReactImportFrom}';`;
  }

  private _buildHooksJSDoc(operationName: string): string {
    return `
  /**
   * __use${operationName}__
   * To read a fragment data from Apollo Cache, call \`use${operationName}\` and pass it the ID of the cached object.
   * When your component renders, \`use${operationName}\` returns an object from Apollo Client cache that contains data property
   * you can use to render your UI.
   *
   * @param id a string representing the ID of the cached object that will be passed into the useApolloFragment
   *
   * @example
   * const { data } = use${operationName}('fragment-id');
   */`;
  }

  private _buildHooks(fragment: FragmentDefinitionNode): string {
    const suffix = this._getHookSuffix(fragment.name.value);
    const operationName: string = this.convertName(fragment.name.value, {
      suffix,
      useTypesPrefix: false,
    });

    const hookFns = [
      `export function use${operationName}(id: string) {
          return useApolloFragment<${this.getFragmentName(
            fragment,
          )}>(${this.getFragmentVariableName(fragment)}, id);
        }`,
    ];

    if (this.config.addDocBlocks) {
      hookFns.unshift(this._buildHooksJSDoc(operationName));
    }

    const hookResults = [
      `export type ${operationName}HookResult = ReturnType<typeof use${operationName}>;`,
    ];

    return [...hookFns, ...hookResults].join('\n');
  }

  private _getHookSuffix(name: string) {
    if (name.includes('Fragment')) {
      return '';
    }
    return pascalCase(`fragment`);
  }
}
