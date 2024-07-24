import { Primitive } from "relay-runtime/lib/store/RelayStoreTypes"

export interface ConfigOption<T> {
  parse: (value: Primitive | Primitive[]) => T,
  serialize: (value: T) => Primitive | Primitive[],
  test: (value: T) => boolean
}
