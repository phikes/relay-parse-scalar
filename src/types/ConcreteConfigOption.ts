import { ConfigOption } from "./ConfigOption";

export type ConcreteConfigOption = <R>(callback: <T>(configOption: ConfigOption<T>) => R) => R
