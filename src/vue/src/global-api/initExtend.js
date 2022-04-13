import { mergeOptions } from "../util/mergeOptions";

// 通过调用Vue.extend(options)可以返回一个构造器,它其实就是Vue构造函数的 子构造函数,继承了Vue,与Vue构造函数作用一致
// 继承Vue构造函数,这里为了后续便于扩展 options
// 如 const Profile = Vue.extend({template:'xx',...}),Profile是一个构造函数,
// new Profile({$el:'xxx', crated(){} ....}), 在Sub构造函数中拿到传入的options,然后_init时会合并options,将Vue.extend传入的options与 new 传入的options进行合并！！！

export default function initExtend(Vue) {
  let cid = 0; //组件的唯一标识

  // 创建子类继承Vue父类 便于属性扩展
  Vue.extend = function (extendOptions) {
    // 创建子类的构造函数 并且调用初始化方法
    const Sub = function VueComponent(options) {
      // 这里的this指向Sub实例
      // _init是Vue.prototype上的方法, this.__proto__ = Sub.prototype  this.__proto__.__proto__ = Vue.Prototype
      this._init(options); //调用Vue初始化方法
    };

    Sub.cid = cid++;
    // 这里的this指向Vue,通过Vue.extend调用的方法,this.prototype = Vue.prototype
    Sub.prototype = Object.create(this.prototype); // 子类原型指向父类,原型继承
    //constructor指回自己
    Sub.prototype.constructor = Sub;
    // this.options就是Vue.options,全局(Vue.)options和传入options合并
    Sub.options = mergeOptions(this.options, extendOptions);

    return Sub;
  };
}
