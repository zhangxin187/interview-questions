import { initMixin } from "./init.js";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";
import { initGlobalApi } from "./global-api";

// Vue就是一个构造函数 通过new关键字进行实例化
function Vue(options) {
  // 这里开始进行Vue初始化工作
  this._init(options);
}
// _init方法是挂载在Vue原型的方法 通过引入文件的方式进行原型挂载需要传入Vue
// 此做法有利于代码分割
initMixin(Vue);

// 混入_render
renderMixin(Vue);

// 混入_update
lifecycleMixin(Vue);

// 挂载全局API， 如Vue.extend Vue.use Vue.mixin
initGlobalApi(Vue);

export default Vue;


// demo使用
Vue.mixin({
  created() {
    // console.log("mixin created");
  },
  components: {
    log() {
      return "mixin";
    },
  },
});

Vue.component("component1", {
  data() {
    return {
      count: 1,
    };
  },
  template: `<div>我是compoent1，我的count是{{count}}</div>`,
});

// const Ctor = Vue.extend({
//   data() {
//     return {
//       count: 1,
//     };
//   },
//   template: "<div>我是compoent1,count:{{count}}</div>",
//   components: {
//     log() {
//       return "extend";
//     },
//   },
// });

// // 实例化
// new Ctor({
//   created() {
//     console.log("new extend返回值 传入的参数");
//   },
//   components: {
//     log() {
//       return "new Ctor";
//     },
//   },
// });

// Vue实例化

const component2 = {
  template: `<h3 style="color:orange">component2</h3>`,
  beforeCreate() {
    console.log("子组件beforeCreate");
  },
  created() {
    console.log("子组件的created");
  },
  beforeMount() {
    console.log("子组件的beforeMount");
  },
  mounted() {
    // 这里$el可以拿到渲染后的dom
    console.log("子组件的mounted");
  },
};

const vm = new Vue({
  el: "#app",
  data() {
    return {
      a: 111,
      b: [1, 2, 34],
    };
  },
  template: `<div id="aaa" style="color:red">hello{{a}} <div> {{b}}</div> <div>{{computedA}}</div></div>`,
  components: {
    component2,
  },

  watch: {
    a(newVal, oldVal) {
      console.log("我是watch", newVal, oldVal);
    },
  },

  computed: {
    computedA() {
      console.log("我是computed");
      return this.a + 1;
    },
  },

  beforeCreate() {
    console.log("父组件beforeCreate");
  },
  created() {
    console.log("父组件的created");
  },
  beforeMount() {
    console.log("父组件的beforeMount");
  },
  mounted() {
    // 这里$el可以拿到渲染后的dom
    console.log("父组件的mounted");
  },
});

// 我们在这里模拟更新
setTimeout(() => {
  // 批量异步更新机制
  vm.a = 456;
  vm.a = 999;
  vm.b.push(111);

  // 当data更新了,这里手动去update,更新dom
  // 这里不会再执行init => compiler了,更新了data,后面在_render中调用 render函数时将虚拟dom转为真实dom,可以拿到新的data
  // 这里只新dom替换老dom,不触发compiler,触发render+patch
  // vm._update(vm._render());
}, 1000);
