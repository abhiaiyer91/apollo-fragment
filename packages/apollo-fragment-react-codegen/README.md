# Apollo Fragment React Codegen
This package contains a plugin for [GraphQL Code Generator](https://graphql-code-generator.com/) 
that allows to generate React hooks with corresponding TypeScript types 
based on `useApolloFragment` from `apollo-fragment-react` and GraphQL fragments defined in your app.

## Setup
This package **requires** [TypeScript React Apollo](https://graphql-code-generator.com/docs/plugins/typescript-react-apollo) plugin 
to be installed and setup to generate fragment documents and types.

First, install the package:
```bash
yarn add -D apollo-fragment-react-codegen
```
Then register the plugin in GraphQL Code Generator config (`codegen.yml` by default):
```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - typescript-react-apollo
   - apollo-fragment-react-codegen
 config:
   withHooks: true
```
Now, whenever you run your codegen script, it will also generate React hooks based on existing fragment definitions 
which you then can use in your code instead of `useApolloFragment`.

## Usage
Suppose you have some existing code to read user name and avatar from Apollo Client cache using `useApolloFragment`:
```typescript
// UserAvatar.tsx
import gql from 'graphql-tag'
import { useApolloFragment } from 'apollo-fragment-react'
import { User } from 'src/generated.ts'

const userAvatarAndNameFragment = gql`
    fragment userAvatarAndNameFragment on User {
        name
        avatarUrl
    }
`

type FragmentData = Pick<User, 'name' | 'avatarUrl'>

export function UserAvatar(userId: string) {
    const { data: userData } = useApolloFragment<FragmentData>(userId)

    if (!userData) {
        return null
    }

    return <img src={userData.avatarUrl} alt={`${userData.name} avatar`} />
}
```
To leverage GraphQL codegen, let's move the fragment definiton into a `.graphql` file:
```graphql
# fragments.graphql

fragment userAvatarAndName on User {
    name
    avatarUrl
}
```
and make sure that we include this file in the codegen configuration:
```yml
documents:
  - "src/**/*.graphql"
  # OR
  # - "src/**/fragments.graphql"
```
Now, when we run the codegen script, the generated file should also include something like this:
```typescript
export function useUserAvatarAndNameFragment(id: string) {
  return useApolloFragment<UserAvatarAndNameFragment>(
    UserAvatarAndNameFragmentDoc,
    id
  )
}
export type UserAvatarAndNameFragmentHookResult = ReturnType<
  typeof useUserAvatarAndNameFragment
>
```
Next we can update our `UserAvatar` component:
```typescript
// UserAvatar.tsx
import { useUserAvatarAndNameFragment } from 'src/generated.ts'

export function UserAvatar(userId: string) {
    const { data: userData } = useUserAvatarAndNameFragment(userId)

    if (!userData) {
        return null
    }

    return <img src={userData.avatarUrl} alt={`${userData.name} avatar`} />
}
```
`useUserAvatarAndNameFragment` is just a wrapper around `useApolloFragment` which reduce the amount of boilerplate and also properly types the return value.