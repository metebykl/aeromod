export type QueryConfig<T extends (...args: never[]) => unknown> = Omit<
  ReturnType<T>,
  "queryKey" | "queryFn"
>;
