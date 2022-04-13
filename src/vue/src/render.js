// src/render.js

import { createElement, createTextNode } from "./vdom/index";
import { nextTick } from "./util/next-tick";

export function renderMixin(Vue) {
  Vue.prototype._render = function () {
    const vm = this;
    // 获取模板编译生成的render方法
    const { render } = vm.$options;
    // 生成vnode--虚拟dom
    // render内部执行  _c('div',{id:"a",style:{"color":"red"}},_v("hello"+_s(a)))
    // 所以一个template必须要有一个根元素,若有多个根元素,则这里的render函数的内部是这样的 return _c(tag,...)_c(tag,...)，这样通过ast转出来的render函数是不合法的,执行会报错
    // render函数的的内部会访问data,触发getter,收集依赖
    const vnode = render.call(vm);

    return vnode;
  };

  // render函数里面有_c _v _s方法需要定义
  Vue.prototype._c = function (...args) {
    // 创建虚拟dom元素
    return createElement(this, ...args);
  };

  // 文本
  Vue.prototype._v = function (text) {
    // 创建虚拟dom文本
    return createTextNode(this, text);
  };

  // 双括号插值
  Vue.prototype._s = function (val) {
    // 如果模板里面的是一个对象  需要JSON.stringify
    // 在template中是这样的 {{a}} 而a是一个对象
    // 是在这里获取 data的,虽然在template时,写在一个html字符串中,其实访问这个属性是在js中完成的,html只起渲染作用,类似于模版引擎
    // 这里会收集依赖
    return val == null
      ? ""
      : typeof val === "object"
      ? JSON.stringify(val)
      : val; // 使用了with,这里等同于this.val,实例的this
  };

  // 挂载在原型的nextTick方法 可供用户手动调用
  Vue.prototype.$nextTick = nextTick;
}
