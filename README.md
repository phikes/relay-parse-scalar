# Relay Parse Scalar

Parse scalars into complex objects (e.g. dates) and serialize them before
executing a GraphQL operation.

## Usage

```JSON
{
  // ...
  "customScalarTypes": {
    "ISO8601DateTime": "Date"
  }
}
```

```typescript
// ...
import RelayDefaultHandlerProvider from "relay-runtime/lib/handlers/RelayDefaultHandlerProvider";

import {
  configOption,
  isParseScalarHandle,
  parseScalarHandle,
  environmentProxy
} from "relay-transform-scalar"

const config = {
  ISO8601DateTime: configOption({
    parse: (dateString) => typeof dateString === "string" ? parse(dateString) : null, // your parse logic here
    serialize: (date) => date ? format(date) : null, // your serialization logic here
    test: (value) => value instanceof Date // test if this config option should be used for serialization
  })
}

function handlerProvider(handle: string) {
    if (isParseScalarHandle(handle)) return parseScalarHandle(config)
    // ...
    return RelayDefaultHandlerProvider(handle);
}

const environment = environmentProxy(new Environment({
  handlerProvider,
  /* ... */
}), config);
```

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
  a. Whenever a field with the parse directive is encountered, it receives a
  handler for that field which parses the field according to your config and
  sets it on the record (in a hack-ish way though).
  b. Whenever a GraphQL operation is executed through the environment any
  variable are serialized according to your config (this is what the `test`
  property is for).
