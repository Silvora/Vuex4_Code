import { forEachVal } from "./utils";
//每一个模块的实例
class Module {
  constructor(rwaModule) {
    this._raw = rwaModule;
    this.state = rwaModule.state;
    this._chidlren = {};
    this.namespaced = rwaModule.namespaced;
  }
  addChild(key, module) {
    this._chidlren[key] = module;
  }
  getChild(key) {
    return this._chidlren[key];
  }
  forEachChild(fn) {
    forEachVal(this._chidlren, fn);
  }
  forEachGetter(fn) {
    if (this._raw.getters) {
      forEachVal(this._raw.getters, fn);
    }
  }
  forEachMutation(fn) {
    if (this._raw.mutations) {
      forEachVal(this._raw.mutations, fn);
    }
  }
  forEachAction(fn) {
    if (this._raw.actions) {
      forEachVal(this._raw.actions, fn);
    }
  }
}

export default class ModuleCollection {
  constructor(rootModule) {
    this.root = null;
    //遍历数据
    this.register(rootModule, []);
  }
  register(rwaModule, path) {
    //赋值模块数据
    const newModules = new Module(rwaModule);
    //模块注册,拿到newModules
    //rwaModule.newModule = newModules;

    if (path.length == 0) {
      this.root = newModules;
    } else {
      //模块注册
      const parent = path.slice(0, -1).reduce((module, current) => {
        return module.getChild(current);
      }, this.root);
      parent.addChild(path[path.length - 1], newModules);
    }
    //是否有modules
    if (rwaModule.modules) {
      forEachVal(rwaModule.modules, (rawChildModule, key) => {
        this.register(rawChildModule, path.concat(key));
      });
    }

    return newModules;
  }
  //是否数据隔离
  //添加获取路径
  getNamespaced(path) {
    let module = this.root;
    return path.reduce((namespacedStr, key) => {
      module = module.getChild(key);
      return namespacedStr + (module.namespaced ? key + "/" : "");
    }, "");
  }
}
