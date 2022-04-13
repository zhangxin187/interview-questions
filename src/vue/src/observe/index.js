import { arrayMethods } from "./arrary";
import Dep from "./dep";

class Observer {
  // 观测值
  constructor(value) {
    // 不仅给对象属性上添加dep,对象自身也需要添加dep，这里主要是给数组添加dep的！即{a:[1,2,3]},后续在defineReactive中发现value是数组会递归创建Observe的
    this.dep = new Dep(); // 给对象和数组都增加dep属性

    // 为复杂数据类型添加 `__ob__`属性,其值是当前Observer实例,代表已被响应式处理
    // 故属性可以通过__ob__拿到对应的Oberserver实例
    Object.defineProperty(value, "__ob__", {
      //  值指代的就是Observer的实例
      value: this,
      //  不可枚举
      enumerable: false,
      writable: true,
      configurable: true,
    });

    if (Array.isArray(value)) {
      // 这里对数组做了额外判断
      // 通过重写数组原型方法来对数组的七种方法进行拦截
      value.__proto__ = arrayMethods;
      // 对数组的每一项进行递归,存在数组项为对象、数组的情况,为对象的话走属性劫持
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  walk(data) {
    // 对象上的所有属性依次进行观测
    // 必须要通过一层循环,在外面拿到key和value,然后在definproperty属性劫持,get中返回其value
    // 不可以get中 `return data[key]` 这样的写法，这样会造成死循环！ data[key]触发了get,在get中又调用 data[key]
    for (let key in data) {
      defineReactive(data, key, data[key]);
    }
  }

  // 递归观测数组，重写数组方法
  observeArray(items) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i]);
    }
  }
}

// Object.defineProperty数据劫持核心
function defineReactive(data, key, value) {
  // 递归
  let childOb = observe(value); // childOb就是Observer实例

  // 每一个属性都有一个Dep实例
  let dep = new Dep(); // 为每个属性实例化一个Dep

  // --如果value还是一个对象会继续走一遍odefineReactive 层层遍历一直到value不是对象才停止
  //   思考？如果Vue数据嵌套层级过深 >>性能会受影响

  // 这里只是先观测着,劫持对象属性观测,后续render中的访问data属性时,getter触发时收集依赖
  Object.defineProperty(data, key, {
    // 真正触发getter是在_render，_render中执行用户传入的render函数或我们转化的render函数,这时会访问data属性,触发依赖收集
    get() {
      // 页面取值的时候 可以把watcher收集到dep里面--依赖收集
      // 只有Dep.target有值时才会收集依赖,在$mount时才会注册Watcher,Watcher首次时会将Dep.target赋值
      if (Dep.target) {
        // 如果有watcher dep就会保存watcher 同时watcher也会保存dep
        dep.depend();

        // 如果是简单数据类型，childOb会是undefined
        if (childOb) {
          // 这里表示 属性的值依然是一个对象 包含数组和对象 childOb指代的就是Observer实例对象  里面的dep进行依赖收集
          // 比如{a:[1,2,3]} 属性a对应的值是一个数组 观测数组的返回值就是对应数组的Observer实例对象
          childOb.dep.depend(); // 数组收集依赖,每个数组都有个dep 收集watcher,当调用重写方法时,执行notify
          // 如果数据结构类似 {a:[1,2,[3,4,[5,6]]]} 这种数组多层嵌套  数组包含数组的情况  那么我们访问a的时候 只是对第一层的数组进行了依赖收集 里面的数组因为没访问到  所以五大收集依赖  但是如果我们改变了a里面的第二层数组的值  是需要更新页面的  所以需要对数组递归进行依赖收集
          if (Array.isArray(value)) {
            // 如果内部还是数组
            dependArray(value); // 不停的进行依赖收集
          }
        }
      }
      return value;
    },

    set(newValue) {
      if (newValue === value) return;
      // 如果赋值的新值也是一个对象  需要观测
      observe(newValue);
      value = newValue;

      // 一个组件一个Wathcer
      dep.notify(); // 通知渲染watcher去更新--派发更新
    },
  });
}

export function observe(value) {
  // 如果传过来的是对象或者数组 进行属性劫持
  // 简单数据类型直接忽略,不需要劫持
  // 每个引用数据都有一个Oberserve实例
  if (
    Object.prototype.toString.call(value) === "[object Object]" ||
    Array.isArray(value)
  ) {
    return new Observer(value);
  }
}

// 递归收集数组依赖
// 形如的[[123],[23]]的递归收集依赖
function dependArray(value) {
  let e;
  for (let i = 0, l = value.length; i < l; i++) {
    e = value[i];
    // e.__ob__代表e已经被响应式观测了 但是没有收集依赖 所以把他们收集到自己的Observer实例的dep里面
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      // 如果数组里面还有数组  就递归去收集依赖
      dependArray(e);
    }
  }
}
