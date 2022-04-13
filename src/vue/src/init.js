// src/init.js
import { initState } from "./state";
import { compileToFunctions } from "./compiler";
import { mountComponent } from "./lifecycle";
import { mergeOptions } from "./util/mergeOptions";
import { callHook } from "./util/callHook";
import Watcher from "./observe/watcher";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    // 这里的this代表调用_init方法的对象(实例对象)
    //  this.$options就是用户new Vue的时候传入的属性

    // 这里要和全局的option进行合并,存在全局的minxin！！！
    // vm.constructor = vm.__proto__.constructor = Vue
    // 这里的this不仅仅是Vue实例,也可能是Sub实例,Sub是Vue.extend()的返回值
    // 故这里vm.constructor.options 可能是 Vue.options 或 Sub.options
    vm.$options = mergeOptions(vm.constructor.options, options);

    // 调用生命周期hook,状态初始化之前,数据观测、事件配置之前
    callHook(vm, "beforeCreate");

    // 初始化状态
    initState(vm);

    // 状态初始化完毕,data属性已经观测完毕
    callHook(vm, "created");

    // 如果有el属性 进行模板渲染,页面渲染只会调一次$mount，后续不再模版渲染
    // 如果是组件的话,是没有el的,组件会调用$mount
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };

  // 这块代码在源码里面的位置其实是放在entry-runtime-with-compiler.js里面
  // 代表的是Vue源码里面包含了compile编译功能 这个和runtime-only版本需要区分开
  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    // 获取DOM
    el = document.querySelector(el);
    // 如果不存在render属性
    if (!options.render) {
      // 如果存在template属性
      let template = options.template;

      if (!template && el) {
        // 如果不存在render和template 但是存在el属性 直接将el自身作为template
        // el.outerHTML获取自身的html字符串
        template = el.outerHTML;
      }

      // 最终需要把tempalte模板转化成render函数
      if (template) {
        // 拿到形如这样的一个函数
        // (function anonymous(
        //   ) {
        //   with(this){return _c('div',{id:"a",style:{"color":"red"}},_v("hello"+_s(a)))}
        //   })
        // compiler阶段！！！将html字符串转为render函数
        const render = compileToFunctions(template);
        options.render = render;
      }
    }

    // 将当前组件实例挂载到真实的el节点上面
    return mountComponent(vm, el);
  };

  // 挂载侦听属性API
  Vue.prototype.$watch = function (exprOrFn, cb, options) {
    const vm = this;
    //  user: true 这里表示是一个用户watcher
    new Watcher(vm, exprOrFn, cb, { ...options, user: true });

    // 如果有immediate属性 代表需要立即执行回调,上来先执行一次
    if (options.immediate) {
      cb();
    }
  };
}
