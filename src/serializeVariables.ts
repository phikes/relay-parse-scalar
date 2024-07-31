import { Config } from "./types"

export const serializeVariables = (variables: Record<string, any>, config: Config): Record<string, any> => {
  const serializedVariables = Object.keys(variables).reduce((serializedVariables, key) => {
    const value = variables[key]
    const configOption = Object.values(config).find((configOption) => configOption((concreteConfigOption) => concreteConfigOption.serialize && concreteConfigOption.serializeTest?.(value)))

    return {
      ...serializedVariables,
      [key]: configOption ? configOption((concreteConfigOption) => concreteConfigOption.serialize!(value)) : value
    }
  }, {})

  return serializedVariables
}
