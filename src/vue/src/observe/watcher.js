import { pushTarget, popTarget } from "./dep";
import { queueWatcher } from "./scheduler";
import { isObject } from "../util";

// 全局变量id  每次new Watcher都会自增
let id = 0;

// wathcer分为 渲染wather、计算属性wather、侦听watcher
export default class Watcher {
  /**
   * @param {*} vm
   * @param {*} exprOrFn 表达式 or 函数, 渲染Watcher这个参数一定是函数, 自定义watcher可能是函数，可能是表达式
   * @param {*} cb 回调函数
   * @param {*} options
   * @memberof Watcher
   */
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn; // _update更新方法,重新render
    this.cb = cb; //回调函数 比如在watcher更新之前可以执行beforeUpdate方法
    this.options = options; //额外的选项 true代表渲染watcher
    this.id = id++; // watcher的唯一标识
    this.deps = []; //存放dep的容器
    this.depsId = new Set(); //用来去重dep

    /** 监听器watch特有 */
    //标识是用户自定义watcher
    this.user = options.user;

    /** computed特有 */
    // 标识计算属性watcher
    this.lazy = options.lazy;
    //dirty可变  表示计算watcher是否需要重新计算 默认值是true,实现缓存
    this.dirty = this.lazy; 

    // 如果表达式是一个函数
    if (typeof exprOrFn === "function") {
      this.getter = exprOrFn;
    } else {
      // 侦听wathcer
      this.getter = function () {
        //用户watcher传过来的可能是一个字符串   类似a.a.a.a.b
        let path = exprOrFn.split(".");
        let obj = vm;
        // 通过循环访问拿到表达式对应最终对应的属性值
        // 这里访问了data属性，会触发getter,会将当前watcher进行收集
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]]; //vm.a.a.a.a.b
        }
        return obj;
      };
    }

    // 实例化就会默认调用get方法,依赖收集
    // 非计算属性watcher实例化就会默认调用get方法,进行取值,保留结果
    // 计算属性实例化的时候不要去调用get
    this.value = this.lazy ? undefined : this.get();
  }

  get() {
    pushTarget(this); // 在调用方法之前先把当前watcher实例推到全局Dep.target上,方便收集依赖

    // 计算属性在这里执行用户定义的get函数 访问计算属性的依赖项 从而把自身计算Watcher添加到依赖项dep里面收集起来
    const res = this.getter.call(this.vm); //如果watcher是渲染watcher 那么就相当于执行  vm._update(vm._render()) 这个方法在render函数执行的时候会取值 从而触发getter 依赖收集
    // 在调用方法之后把当前watcher实例从全局Dep.target移除
    popTarget();

    // 用户定义的wathcer需要返回值,组件的渲染Watcher不需要返回值
    return res;
  }

  //   把dep放到deps里面 同时保证同一个dep只被保存到watcher一次  同样的  同一个watcher也只会保存在dep一次
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      // 为了避免dep重复
      this.depsId.add(id);

      this.deps.push(dep);
      // 直接调用dep的addSub方法  把自己--watcher实例添加到dep的subs容器里面
      dep.addSub(this);
    }
  }

  update() {
    // 计算属性依赖的值发生变化 只需要把dirty置为true,下次访问到了 重新计算
    if (this.lazy) {
      this.dirty = true;
    } else {
      // 每次watcher进行更新的时候  是否可以让他们先缓存起来  之后再一起调用
      // 异步队列机制,同一watcher只会推入一次,根据watcher.id来区别
      queueWatcher(this);
    }
  }

  // 计算属性重新进行计算 并且计算完成把dirty置为false
  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }

  depend() {
    // 计算属性的watcher存储了依赖项的dep
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend(); //调用依赖项的dep去收集渲染watcher
    }
  }

  run() {
    // 数据更新之前调用,_update之前调用
    const newVal = this.get(); //新值
    const oldVal = this.value; //老值
    this.value = newVal; //现在的新值将成为下一次变化的老值

    // 如果是用户自定义wathcer
    if (this.user) {
      // 如果两次的值不相同  或者值是引用类型 因为引用类型新老值是相等的 他们是指向同一引用地址
      if (newVal !== oldVal || isObject(newVal)) {
        // 执行watch的回调函数
        this.cb.call(this.vm, newVal, oldVal);
      }
    } else {
      // 渲染watcher
      this.get();
    }
  }
}





