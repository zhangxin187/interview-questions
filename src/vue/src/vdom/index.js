import { isObject, isReservedTag } from "../util";

// 定义Vnode类
// 生成虚拟DOM
export default class Vnode {
  // 生成一个 {tag:xx,data:xx,key:xx}这样的对象,是对DOM的描述
  constructor(tag, data, key, children, text, options) {
    this.tag = tag;
    this.data = data;
    this.key = key;
    this.children = children;
    this.text = text;
    this.componentOptions = options; // 组件特有属性,存放组件构造函数、组件标签中的内容(插槽内容)
  }
}

// 创建元素vnode 等于render函数里面的 h=>h(App)
// 将参数转为虚拟DOM,虚拟DOM就是对DOM元素的一个描述对象
// 自定义组件也可以作为createElment的参数,此时tag就不是一个html标签了
export function createElement(vm, tag, data = {}, ...children) { // 剩余参数作为children数组,作为子VNode
  let key = data.key;

  if (isReservedTag(tag)) {
    // 如果是普通标签
    return new Vnode(tag, data, key, children);
  } else {
    // 否则就是组件
    // 这个Cotr有可能是对象,有可能是构造函数,使用Vue.component注册的全局组件,其内部会调用Vue.extend(),返回一个VueComponent构造函数
    // 通过Vue构造函数创建的组件,options中的components可能有对象,也需要Vue.exntend包装,任何组件都需要Vue.extend包装为构造函数
    let Ctor = vm.$options.components[tag];
    return createComponent(vm, tag, data, key, children, Ctor);
  }
}

// 创建文本vnode
export function createTextNode(vm, text) {
  return new Vnode(undefined, undefined, undefined, undefined, text);
}

// 创建组件VNode
function createComponent(vm, tag, data, key, children, Ctor) {
  if (isObject(Ctor)) {
    //   如果没有被改造成构造函数
    Ctor = vm.$options._base.extend(Ctor);
  }

  // 给组件VNode添加回调
  data.hook = {
    // 执行$mount,组件初始化渲染
    init(vnode) {
      let child = (vnode.componentInstance = new Ctor({ _isComponent: true })); //实例化组件
      child.$mount(); // 组件不会传入el属性, 需要手动挂载,为了将组件的VNode转为真实DOM渲染到页面上
    },
  };

  return new Vnode(
    `vue-component-${Ctor.cid}-${tag}`, // 组件名,不重复即可
    data,
    key,
    undefined,
    undefined,  // 组件VNode是没有children的,写在组件标签中间的内容是插槽内容,不能将其添加在VNode的children属性上,避免在patch时被创建为文本节点
    {
      Ctor,
      children, // 要将children添加至VNode.componentOpitons中
    }
  );
}
