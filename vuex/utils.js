export function forEachVal(obj, fn) {
  //console.log(obj, fn);
  Object.keys(obj).forEach((key) => fn(obj[key], key));
}

export function getNewSate(state, path) {
  return path.reduce((state, key) => state[key], state);
}
export function isPromise(val) {
  return val && typeof val.then === "function";
}
