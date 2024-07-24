import { ConcreteConfigOption } from "./types/ConcreteConfigOption"
import { ConfigOption } from "./types/ConfigOption"

export const configOption = <T>(configOption: ConfigOption<T>): ConcreteConfigOption => (callback) => callback(configOption)
