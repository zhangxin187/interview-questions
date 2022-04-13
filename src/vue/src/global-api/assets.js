export const ASSETS_TYPE = ["component", "directive", "filter"];
// 存在全局filter、全局directive,全局component, 最终都要放到Vue.options上的,在局部组件注册时,会合并全局的Vue.options,这样就可以在任何Vue实例(组件)中使用全局组件、全局指令、全局过滤器
export default function initAssetRegisters(Vue) {
  ASSETS_TYPE.forEach((type) => {
    Vue[type] = function (id, definition) {
      // 通过Vue.component注册的全局组件
      if (type === "component") {
        // 全局组件注册,this指向Vue
        // this.options._base指向Vue,源码也是这样写的
        // 用Vue.extend将传来options(definition)包装,返回一个Vue子构造函数(VueComponent)
        definition = this.options._base.extend(definition);
      }

      // 将其添加到全局options的components对象中,后续与组件合并
      this.options[type + "s"][id] = definition;
    };
  });
}

