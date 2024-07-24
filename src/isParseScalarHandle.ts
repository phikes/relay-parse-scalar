import { PARSE_SCALAR_HANDLE_REGEX } from "./parseScalarHandle";

export const isParseScalarHandle = (handle: string) => PARSE_SCALAR_HANDLE_REGEX.test(handle)
