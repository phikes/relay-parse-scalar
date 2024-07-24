import { IEnvironment } from "relay-runtime";
import { Config } from "./types/Config";

export const environmentProxy = (environment: IEnvironment, config: Config): IEnvironment => 
  new Proxy(environment, {
    get: function (target, prop, receiver) {
      if (
        prop === "execute"
        || prop === "executeMutation"
        || prop === "executeWithSource"
      ) return (
        ...args: Parameters<IEnvironment["execute"]> | Parameters<IEnvironment["executeMutation"]> | Parameters<IEnvironment["executeWithSource"]>
      ) => {
        const { operation: { request: { variables, ...restRequest }, ...restOperation } } = args[0]

        const serializedVariables = Object.keys(variables).reduce((serializedVariables, key) => {
          const value = variables[key]
          const configOption = Object.values(config).find((configOption) => configOption((concreteConfigOption) => concreteConfigOption.test(value)))

          return {
            ...serializedVariables,
            [key]: configOption ? configOption((concreteConfigOption) => concreteConfigOption.serialize(value)) : value
          }
        }, {})

        args[0].operation = {
          request: {
            variables: serializedVariables,
            ...restRequest
          },
          ...restOperation,
        }

        // looks like ts can't know we hand in the right args for one of the
        // props we narrowed down above
        return (Reflect.get(target, prop) as any).apply(receiver, args)
      }

      return Reflect.get(target, prop, receiver)
    }
  })
