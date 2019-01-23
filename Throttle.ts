function throttle(result) {
  const MAX_SLEEP = 250;

  const cache = CacheService.getScriptCache();
  
  const cacheKey = "exec qps";
  const lastCall = cache.get(cacheKey) || new Date().getTime();
  
  Utilities.sleep(Math.min(MAX_SLEEP, new Date().getTime()-lastCall));

  cache.put(cacheKey, new Date().getTime(), 1);

  return result;
}

function _throttle(fn, args) {
  Logger.log("_throttle: %s(%s)", fn, args);
  
  return throttle(fn.apply(this, args));
}
