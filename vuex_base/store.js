import { forEachVal } from "./utils";
import { reactive } from "vue";
import storeKey from "./defaultKey";

export default class Store {
  constructor(options) {
    //this.state = options.state;
    const store = this;
    store._state = reactive({ data: options.state });

    const _getters = options.getters;

    store.getters = {};
    forEachVal(_getters, function (fn, key) {
      let res = fn(store.state);
      console.log(
        "-----",
        fn,
        key,
        store.getters,
        store.state,
        store.state.count,
        res,
        store._state.data
      );

      Object.defineProperty(store.getters, key, {
        enumerable: false,
        get: () => fn(store.state),
      });
    });

    store._mutations = Object.create(null);
    store._actions = Object.create(null);
    const _mutations = options.mutations;
    const _actions = options.actions;
    forEachVal(_mutations, function (mutations, key) {
      store._mutations[key] = (payload) => {
        mutations.call(store, store.state, payload);
      };
    });
    forEachVal(_actions, function (actions, key) {
      store._actions[key] = (payload) => {
        actions.call(store, store, payload);
      };
    });
  }
  //可以解构
  commit = (type, payload) => {
    this._mutations[type](payload);
  };
  dispatch = (type, payload) => {
    this._actions[type](payload);
  };
  get state() {
    //类属性访问器
    //console.log(this._state.data);
    return this._state.data;
  }
  install(app, appKey) {
    app.provide(appKey || storeKey, this);
    app.config.globalProperties.$store = this; //添加$store属性
  }
}
