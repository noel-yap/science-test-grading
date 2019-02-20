export module Functions {
  export function identity(arg: any): any {
    return arg;
  }

  export function bindLeft(fn: (...any) => any, ...boundArgs: any) {
    return function(...args: any) {
      return fn(...boundArgs, ...args);
    };
  }

  export function bindRight(fn: (...any) => any, ...boundArgs: any) {
    return function(...args: any) {
      return fn(...args, ...boundArgs);
    };
  }

  export function compose(...fns: ((...any) => any)[]): any {
    return (...args: any[]) => {
      return fns.reduceRight((arg: any, f: (...any) => any) => {
        return (Array.isArray(arg)) ? f(...arg) : f(arg);
      }, args);
    };
  }
}
