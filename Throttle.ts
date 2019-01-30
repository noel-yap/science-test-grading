function throttle(result) {
  const MAX_SLEEP = 250;

  const cache = CacheService.getScriptCache();
  
  const cacheKey = 'exec qps';
  const lastCall = parseInt(cache.get(cacheKey)) || new Date().getTime();
  
  Utilities.sleep(Math.min(MAX_SLEEP, new Date().getTime() - lastCall));

  cache.put(cacheKey, new Date().getTime().toString(), 1);

  return result;
}

function _throttle(fn, args) {
  console.log(`_throttle: ${fn}(${args})`);
  
  return throttle(fn.apply(this, args));
}
