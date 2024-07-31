# Relay Parse Scalar

Parse scalars into complex objects (e.g. dates) and serialize them before
executing a GraphQL network function.

## Usage

Note: This README uses `ISO8601DateTime` as an example.

### relay.config.json

```JSON
{
  // ...
  "customScalarTypes": {
    "ISO8601DateTime": "Date"
  }
}
```

### Relay setup

```typescript
// ...
import RelayDefaultHandlerProvider from "relay-runtime/lib/handlers/RelayDefaultHandlerProvider";

import {
  configOption,
  isParseScalarHandle,
  parseScalarHandle,
  serializeVariables
} from "relay-transform-scalar"

const config = [
  configOption({
    parse: (dateString) => typeof dateString === "string" ? parse(dateString) : null, // your parse logic here
    parseType: "ISO8601DateTime",
    serialize: (date) => date ? format(date) : null, // your serialization logic here
    serializeTest: (value) => value instanceof Date // test if this config option should be used for serialization
  })
]

function handlerProvider(handle: string) {
    if (isParseScalarHandle(handle)) return parseScalarHandle(config)
    // ...
    return RelayDefaultHandlerProvider(handle);
}

export const fetchFn = async (request: RequestParameters, variables: Variables) => {
    const body = {
       // ...
       variables: serializeVariables(variables, config)
    }

    // ...

    return resp.json()
}

const createNetwork = () =>  {
  const fetchResponse = async(/* ... */) => {

    // ...

    return fetchFn(params, variables)
  }

  return Network.create(fetchResponse, subscriptionHandler)
}
```

### Marking fields for parsing

Right now you have to insert this GraphQL directive for every field of type
`ISO8601DateTime` otherwise your typescript types will be wrong (the field
would be of type `Date` but at runtime it really is a string because
no transformation happened).

```typescript
// ...

graphql\`
  fragment Something on SomeType {
    someField @__clientField(handle: "parseScalar(ISO8601DateTime)")
  }
\`
```

## How it works

1. Using the above relay config the compiler inserts types for fields which are of
the `ISO8601DateTime` type. Any time a variable or field has the
`ISO8601DateTime` GraphQL type the generated type will be `Date`.

2. The relay environment is configured to do two things:

  * Whenever a field with the parse directive is encountered, it receives a
    handler for that field which parses the field according to your config and
    sets it on the record (in a hack-ish way though).

  * Whenever a GraphQL network function is called (in the example from above
    via `fetch`) the variables are serialized.
