export module Functions {
  export function identity(arg: any): any {
    return arg;
  }

  export function bindLeft(fn: any, ...boundArgs: any) {
    return function(...args: any) {
      return fn(...boundArgs, ...args);
    };
  }

  export function bindRight(fn: any, ...boundArgs: any) {
    return function(...args: any) {
      return fn(...args, ...boundArgs);
    };
  }

  export function compose(...fns: any): any {
    return (...args) => fns.reduce((v, f) => f(v), ...args);
  }
}
