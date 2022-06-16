// import { forEachVal } from "./utils";

import storeKey from "./defaultKey";
import ModuleCollection from "./modules";
import { resetStoreSate, installModules } from "./watchModule";

export default class Store {
  constructor(options) {
    //{state,actions,mutaions,getters,modules}格式化数据
    //以树的形式格式化
    // root
    //   namespaces
    //   state
    //     a
    //     b
    //   _chidlren
    //     a:module
    //     b:module
    this._modules = new ModuleCollection(options);
    //console.log(this._modules);
    //定义状态集合
    this._actions = Object.create(null);
    this._mutations = Object.create(null);
    this._wrappedGetters = Object.create(null);

    this.strict = options.strict || false; //是否是严格模式
    this._commiting = false;

    //模块化解析
    //定义状态   this._modules.root根状态
    const root = this._modules.root;
    installModules(this, root.state, [], root);

    //定义响应式数据
    resetStoreSate(this, root.state);

    //执行插件
    this._subscribe = [];
    options.plugins.forEach((plugin) => plugin(this));
  }
  //插件监控方法
  subscribe(fn) {
    this._subscribe.push(fn);
  }
  //插件赋值方法
  replaceState(newSate) {
    this.watchCommit(() => {
      this._state.data = newSate;
    });
  }

  //获取数据
  get state() {
    return this._state.data;
  }
  //mutation的commit方法
  commit = (type, payload) => {
    const entry = this._mutations[type] || [];
    this.watchCommit(() => {
      //严格模式调用
      entry.forEach((handler) => handler(payload));
    });
    this._subscribe.forEach((sub) => sub({ type, payload }, this.state));
  };
  //action的dispatch调用
  dispatch = (type, payload) => {
    const entry = this._actions[type] || [];
    return Promise.all(entry.map((handler) => handler(payload)));
  };
  //全局的方法和属性
  install(app, appKey) {
    //全局实例
    app.provide(appKey || storeKey, this);
    app.config.globalProperties.$store = this; //添加$store属性
  }
  watchCommit(fn) {
    //严格模式监控
    const commiting = this._commiting;
    this._commiting = true;
    fn();
    this._commiting = commiting;
  }

  registerModule(path, rwaModule) {
    //模块注册
    const store = this;
    if (typeof path == "string") path = [path];

    const newModule = store._modules.register(rwaModule, path);
    installModules(store, store.state, path, newModule);

    resetStoreSate(store, store.state);
  }
}
