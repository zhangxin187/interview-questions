// Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__。
const obj = {
  name: "zx",
  log() {
    console.log(this.name);
  },
};

const o1 = Object.create(obj);
o1.log();

// 模拟实现
// 这个也被用于 原型继承
Object.prototype.create1 = function (o) {
  // 将传入的对象作为构造函数的原型,返回构造函数的实例
  // 不要直接操作__proto__,它只是查找方向的指引
  function F() {}
  F.prototype = o;
  return new F();
};

const o2 = Object.create1(obj);
o2.log();
