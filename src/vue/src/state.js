import initWatch from "./initState/initWatch";
import initData from "./initState/initData";
import initComputed from "./initState/initComputed";

// 初始化状态 注意这里的顺序 比如我经常面试会问到 是否能在data里面直接使用prop的值 为什么？
// 这里初始化的顺序依次是 prop -> methods -> data ->computed -> watch
export function initState(vm) {
  // 获取传入的数据对象
  const opts = vm.$options;
  if (opts.props) {
    // initProps(vm);
  }
  if (opts.methods) {
    // initMethod(vm);
  }
  if (opts.data) {
    // 初始化data
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  // 侦听属性
  if (opts.watch) {
    initWatch(vm);
  }
}
