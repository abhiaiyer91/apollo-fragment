import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates hooks based on apollo-fragment-react with TypeScript typings.
 *
 * It requires typescript-react-apollo to be setup to generate fragment documents.
 */
export interface ApolloFragmentReactRawPluginConfig
  extends RawClientSideBasePluginConfig {
  /**
   * @description Customize the package where apollo-fragment-react lib is loaded from.
   * @default "apollo-fragment-react"
   */
  apolloFragmentReactImportFrom?: string;
  /**
   * @description Allows you to enable/disable the generation of docblocks in generated code.
   * Some IDE's (like VSCode) add extra inline information with docblocks, you can disable this feature if your preferred IDE does not.
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-react-apollo
   *    - apollo-fragment-react-codegen
   *  config:
   *    addDocBlocks: true
   * ```
   */
  addDocBlocks?: boolean;
}
