import Watcher from "../observe/watcher";
import Dep from "../observe/dep";

// 初始化计算属性
export default function initComputed(vm) {
  const computed = vm.$options.computed;

  // 用来存放计算watcher
  const watchers = (vm._computedWatchers = {}); 

  for (let k in computed) {
    // 获取用户定义的计算属性
    const userDef = computed[k]; 

    // 计算属性的值可以是函数 或 对象,对象要写 getter,setter可选,当计算属性被赋值时,可以在setter中更新data
    const getter = typeof userDef === "function" ? userDef : userDef.get; //创建计算属性watcher使用

    // 创建计算watcher，lazy设置为true，lazy是一个标志
    // getter是computed的getter函数,后续可以通过vm._computedWatchers[key]拿对应的watcher实例
    // new Watcher去收集依赖
    watchers[k] = new Watcher(vm, getter, () => {}, { lazy: true });

    // 对computed的getter和setter劫持,同时也将computed的key 添加到this上了,故可以通过this.xx来访问computed属性
    defineComputed(vm, k, userDef);
  }
}

// 重新定义计算属性  对get和set劫持
function defineComputed(target, key, userDef) {
  // definition模版
  const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: () => {},
    set: () => {},
  };

  if (typeof userDef === "function") {
    // 如果是一个函数，需要手动赋值到get上,只有getter
    sharedPropertyDefinition.get = createComputedGetter(key);
  } else {
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = userDef.set;
  }
  // 利用Object.defineProperty来对计算属性的get和set进行劫持
  // 后续也可以通过this.[computed]拿到计算属性,属性劫持,拿到的是计算后的值
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

// 重写计算属性的get方法 来判断是否需要进行重新计算
function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatchers[key]; //获取对应的计算属性对应Watcher实例
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate(); //计算属性取值的时候 如果是脏的  需要重新求值
      }

      // 上述watcher.get()执行完毕,此时Dep.target应该是渲染watcher
      if (Dep.target) {
        // 如果Dep还存在target 这个时候一般为渲染watcher 计算属性依赖的数据也需要收集
        watcher.depend();
      }
      return watcher.value;
    }
  };
}
