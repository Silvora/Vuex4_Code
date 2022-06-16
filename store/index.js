import { createStore } from "@/vuex";

//插件
//状态保持
function custom(store) {
  let data = localStorage.getItem("vuex");
  if (data) {
    store.replaceState(JSON.parse(data));
  }
  store.subscribe((mutaion, state) => {
    //console.log(mutaion, state);
    localStorage.setItem("vuex", JSON.stringify(state));
  });
}

export default createStore({
  plugins: [custom],
  strict: true,
  state: {
    count: 0,
  },
  getters: {
    double(state) {
      return state.count * 2;
    },
  }, //vuex4没有实现
  mutations: {
    add(state) {
      console.log(state);
      state.count += 1;
    },
  },
  actions: {
    setAdd({ commit }) {
      commit("add");
    },
  },
  modules: {
    a: {
      namespaced: true,
      state: {
        count: 1,
      },
    },
    b: {
      namespaced: true,
      state: {
        count: 2,
      },
    },
    c: {
      namespaced: true,
      state: {
        count: 3,
      },
    },
  },
});

//动态添加
// store.registerModule(["a", "d"], {
//   namespaced: true,
//   state: {
//     count: 2,
//   },
// });
