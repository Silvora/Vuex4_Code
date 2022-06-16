import { forEachVal, getNewSate, isPromise } from "./utils";
import { reactive, watch } from "vue";
//把所有state里面的数据进行监控
export function resetStoreSate(store, state) {
  store._state = reactive({ data: state });
  const wrappedGetters = store._wrappedGetters;
  store.getters = {};
  forEachVal(wrappedGetters, (getter, key) => {
    Object.defineProperty(store.getters, key, {
      enumerable: true,
      get: getter,
    });
  });
  if (store.strict) {
    enableStrictMode(store);
  }
  //console.log(store);
}
//是否是严格模式
//监控数据变化
function enableStrictMode(store) {
  watch(
    () => store._state.data,
    () => {
      console.assert(store._commiting, "xxxx");
      //console.log(store._commiting)
    },
    { deep: true, flush: "sync" }
  );
  //flush同步监控
}

//安装模块
//把每个模块集中到_actions,_mutations,_wrappedGetters ,_state中
export function installModules(store, rootState, path, module) {
  //console.log(store, rootState, path, module);
  //添加namespaced
  const namespaced = store._modules.getNamespaced(path);
  if (path.length != 0) {
    let parentState = path
      .slice(0, -1)
      .reduce((state, key) => state[key], rootState);
    store.watchCommit(() => {
      parentState[path[path.length - 1]] = module.state;
    });
    //console.log(parentState);
  }

  module.forEachGetter((getter, key) => {
    store._wrappedGetters[namespaced + key] = () => {
      return getter(getNewSate(store.state, path));
    };
  });
  module.forEachMutation((mutaion, key) => {
    const entry =
      store._mutations[namespaced + key] ||
      (store._mutations[namespaced + key] = []);
    entry.push((payload) => {
      mutaion.call(store, getNewSate(store.state, path), payload);
    });
  });
  module.forEachAction((action, key) => {
    const entry =
      store._actions[namespaced + key] ||
      (store._actions[namespaced + key] = []);
    entry.push((payload) => {
      //判断是否是promise
      let res = action.call(store, store, payload);
      if (isPromise(res)) {
        return Promise.resolve(res);
      }
      return res;
    });
  });
  //循环遍历子模块
  module.forEachChild((child, key) => {
    installModules(store, rootState, path.concat(key), child);
  });
}
