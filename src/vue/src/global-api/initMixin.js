import { mergeOptions } from "../util/mergeOptions";
export default function initMixin(Vue) {
  Vue.mixin = function (options) {
    // 这里的this指向Vue构造函数
    this.options = mergeOptions(this.options, options);
    return this;
  };
}
