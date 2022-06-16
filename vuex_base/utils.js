export function forEachVal(obj, fn) {
  //console.log(obj, fn);
  Object.keys(obj).forEach((key) => fn(obj[key], key));
}
