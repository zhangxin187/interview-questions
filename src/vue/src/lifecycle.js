import { patch } from "./vdom/patch";
import Watcher from "./observe/watcher";
import { callHook } from "./util/callHook";

export function mountComponent(vm, el) {
  // 上一步模板编译解析生成了render函数
  // 下一步就是执行vm._render()方法 调用生成的render函数 生成虚拟dom

  // 真实的el选项赋值给实例的$el属性 为之后虚拟dom产生的新的dom替换老的dom做铺垫
  vm.$el = el;

  // el挂载开始之前调用,这里还以拿到$el，不过还是一个html字符串模版,还没有render
  callHook(vm, "beforeMount");

  // 调用_render函数, 在其内部会调用之前生成的render函数,然后生成虚拟dom,dom的描述对象
  // _update在首次渲染和DOM更新时都会被调用，虚拟DOM转为真实DOM，新DOM替换老DOM
  // vm._update(vm._render());
  // 引入watcher的概念 这里注册一个渲染watcher 执行vm._update(vm._render())方法渲染视图

  // getter方法,访问状态,收集依赖
  let updateComponent = () => {
    // render+patch
    // 整个Watcher都会更新,一个组件对应一个Watcher
    vm._update(vm._render());
  };

  // $mount中注册了Watcher
  // mount阶段会实例化Wathcer,一个组件对应一个Wathcer
  // Watcher首次会调用_update方法,完成render更新
  new Watcher(vm, updateComponent, null, true);

  // _update执行完毕,将虚拟dom生成真实dom替换el,页面已经显示了
  callHook(vm, "mounted");
}

// 注意：这里都是以单个组件来讲的,一个组件只有一个Wathcer,也只会产生一个render函数,组件更新时,重新执行render函数生成虚拟dom,然后再_update再patch
// 故_preVnode 保存着当前组件上一次的虚拟节点！！！ 组件维度！！！
export function lifecycleMixin(Vue) {
  // 把_update挂载在Vue的原型
  Vue.prototype._update = function (vnode) {
    const vm = this;
    let preVnode = vm._preVnode;
    // 将当前虚拟节点放到vm上
    vm._preVnode = vnode;

    // 首次渲染_preVnode为空,这时需要生成DOM替换el,dom更新时,_preVode有值,需要执行属性比对差异更新、diff算法
    // 第一次渲染是根据虚拟节点，生成真实节点，替换原来的节点
    if (!preVnode) {
      vm.$el = patch(vm.$el, vnode);
    } else {
      callHook(this.vm, "beforeUpdate");

      // 第二次，生成一个新的虚拟节点，和老的虚拟节点进行对比
      // 将更新后的真实dom赋值给$el
      vm.$el = patch(preVnode, vnode);
      callHook(this.vm, "updated");
    }
  };
}

// $vnode 和_vnode区别
// $vnode代表组件标签占位符的虚拟节点，  _vnode是组件template中html的虚拟节点
// _vnode.parent = $vnode
