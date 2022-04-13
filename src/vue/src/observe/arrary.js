// 先保留数组原型
const arrayProto = Array.prototype;
// 然后将arrayMethods继承自数组原型
// 这里是面向切片编程思想（AOP）--不破坏封装的前提下，动态的扩展功能

export const arrayMethods = Object.create(arrayProto);

let methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "reverse",
  "sort",
];

methodsToPatch.forEach((method) => {
  // 往arrayMethods上追加方法,对象的原型是Arrary.prototype
  // 重写数组方法仅仅为了能劫持数组操作,能感知数组的值更新了，然后可以派发更新。 数组实例如果调用的不是重写方法,则会往__proto__.__proto__上找，就是Arrary.prototype，原型链知识
  arrayMethods[method] = function (...args) {
    // 还是调用原有的方法,Arrary.prototype上的
    const result = arrayProto[method].apply(this, args);
    // 这句话是关键
    // 通过this.xx.methods,故这里的this就是数据本身
    //  比如数据是{a:[1,2,3]} 那么我们使用a.push(4)  this就是a  ob就是a.__ob__  代表的是该数据已经被响应式观察过了指向Observer实例
    const ob = this.__ob__;

    // 这里的标志就是代表数组有新增操作
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2); // x.splice(0,1,2) 这里获取splice可能新增的元素
    }

    // 如果有新增的元素 inserted是一个数组 调用Observer实例的observeArray对数组新增的每一项进行观测
    // 如果新增的是对象,则属性劫持,如果新增的是数组则重写方法,如果简单数据类型忽略
    if (inserted) ob.observeArray(inserted); // 对新增的每一项进行观测
    // 派发更新    
    ob.dep.notify(); //数组派发更新 ob指的就是数组对应的Observer实例 我们在get的时候判断如果属性的值还是对象那么就在Observer实例的dep收集依赖 所以这里是一一对应的  可以直接更新
    return result;
  };
});
