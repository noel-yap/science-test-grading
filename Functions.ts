export module Functions {
  export function bindLeft(fn, ...boundArgs) {
    return function(...args) {
      return fn(...boundArgs, ...args);
    };
  }

  export function bindRight(fn, ...boundArgs) {
    return function(...args) {
      return fn(...args, ...boundArgs);
    };
  }
}
