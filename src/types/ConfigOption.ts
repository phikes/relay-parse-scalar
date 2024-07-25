import { Primitive } from "relay-runtime/lib/store/RelayStoreTypes"

export interface ConfigOption<T> {
  parse: (value: Primitive | Primitive[]) => T,
  parseType: string,
  serialize?: (value: T) => Primitive | Primitive[],
  serializeTest?: (value: T) => boolean
}
