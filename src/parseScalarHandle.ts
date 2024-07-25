import { Config } from "./types/Config"
import { RecordSourceSelectorProxy } from "relay-runtime"
import { isParseScalarHandle } from "./isParseScalarHandle"

export const PARSE_SCALAR_HANDLE_REGEX = /parseScalar\((?<graphQLType>\w+)\)/

export const parseScalarHandle = (handle: string, config: Config) => ({
  update: (store: RecordSourceSelectorProxy, {dataID, fieldKey, handleKey}: {dataID: string, fieldKey: string, handleKey: string}) => {
    if (!isParseScalarHandle(handle)) throw new Error(`\`parseScalarHandle\` received an unknown handle \`${handle}\`. Make sure you call \`parseScalarHandle\` conditionally like so in your handle provider: \`if (isParseScalarHandle(handle) return parseScalarHandle(handle, config))\``)

    const graphQLType = handle.match(PARSE_SCALAR_HANDLE_REGEX)!.groups!.graphQLType
    const configOption = config.find((configOption) => configOption(({ parseType }) => parseType === graphQLType))
    if (!configOption) throw new Error(`\`parseScalar\` received \`${graphQLType}\` for which the provided config didn't contain an option.`)

    const record = store.get(dataID)
    const value = record?.getValue(fieldKey)

    // this is hack-ish as the proxy doesn't allow us to set non-primitive values (except for arrays) directly
    const mutator: any = (record as any)._mutator;

    mutator.setValue(
      dataID,
      handleKey,
      configOption(({ parse }) => parse(value))
    );
  }
})
