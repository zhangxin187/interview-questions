// 要解决循环引用,存在循环引用会导致栈溢出
const cloneDeep = (obj, map = new Map()) => {
  if (obj instanceof Object) {
    if (obj == null) return obj;
    // 函数
    // new 不能实现！
    // if (typeof obj == "function") return new Function(obj);
    // 克隆函数是没有实际意义的，函数是可以复用的，两个对象使用同一个函数也可以，lodash内部并没有克隆函数,而是直接返回
    // 日期
    if (obj instanceof Date) return new Date(obj);

    // 遍历属性
    const o = Array.isArray(obj) ? [] : {};
    // 判断待拷贝的对象是否已存在
    if (map.has(obj)) return obj;
    // 存到map,由于o是引用数据,后续会更新它的值
    // 可以使用weakMap来优化，来提升性能，垃圾回收机制
    map.set(obj, o);
    for (let key in obj) {
      o[key] = cloneDeep(obj[key], map);
    }
    return o;
  } else {
    return obj;
  }
};

const o1 = {
  a: { arr: [1, 2, 3] },
  fn() {},
};
o1.b = o1;
const o2 = cloneDeep(o1);
console.log(o2);

// https://segmentfault.com/a/1190000020255831

// 箭头函数没有prototype,箭头函数可以转string,再使用eval重新生成一个函数,这就相当于拷贝了函数；普通函数得用正则取函数参数、函数体、函数名，然后new Function 生成一个函数