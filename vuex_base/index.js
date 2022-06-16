import { inject } from "vue";
import storeKey from "./defaultKey";
import Store from "./store";

//创建实例
export function createStore(options) {
  return new Store(options);
}

//提供数据
export function useStore(appKey = null) {
  return inject(appKey != null ? appKey : storeKey);
}
