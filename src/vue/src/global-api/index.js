import initMixin from "./initMixin";
import initAssetRegisters, { ASSETS_TYPE } from "./assets";
import initExtend from "./initExtend";

export function initGlobalApi(Vue) {
  // 全局options，组件初始化时,将这个options合并到每个组件上,全局mixin、全局components、全局filter等会往上面放
  Vue.options = {};

  // options.components = {}
  ASSETS_TYPE.forEach((type) => {
    Vue.options[type + "s"] = {};
  });

  // 后续组件合并options时,_base也会合并到组件的$opitons上,所以在每一个组件的$opitons上都有_base属性,指向Vue！！！
  Vue.options._base = Vue; //_base指向Vue

  // 创建Vue.mixin方法
  initMixin(Vue);

  // 创建Vue.extend全局方法
  initExtend(Vue);

  // 创建Vue.component、Vue.filter、Vue.directive 等全局方法
  initAssetRegisters(Vue);

  // Vue.options._base = Vue;
  // // 通过Vue.extend 方法可以产生一个子类，new子类的时候会执行代码初始化流程（组件的初始化）

  // Vue.component = function (id, definition) {
  //   // definition可以传入对象或函数
  //   let name = definition.name || id;
  //   definition.name = name;
  //   if (isObject(definition)) {
  //     definition = Vue.extend(definition);
  //   }
  //   Vue.options.components[name] = definition;
  // };
}
