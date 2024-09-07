type Join<K, P> = K extends string ?
  P extends string ?
  `${K}${"" extends P ? "" : "."}${P}`
  : never : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, ...0[]];

export type NestedTranslations<T> = {
  [K in keyof T]: T[K] extends Record<string, string>
  ? T[K]
  : NestedTranslations<T[K]>
};

export type FlattenObjectKeys<T, D extends number = 6> = [D] extends [never] ? never : T extends object ?
  { [K in keyof T]: K extends string ?
    T[K] extends Record<string, string> ? `${K}` :
    T[K] extends object ? Join<K, FlattenObjectKeys<T[K], Prev[D]>> :
    never : never
  }[keyof T] : "";