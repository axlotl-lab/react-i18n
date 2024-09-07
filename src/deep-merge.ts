/**
 * Checks if the provided value is a non-null object (excluding arrays).
 */
function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deeply merges two objects, combining their properties recursively.
 * 
 * @param target - The target object to merge into.
 * @param source - The source object to merge from.
 * @returns A new object with the combined properties of target and source.
 */
export function deepMerge<T extends object, S extends object>(target: T, ...sources: S[]): T & S {
  if (!sources.length) return target as T & S;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as object, source[key] as object);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target as T & S, ...sources);
}