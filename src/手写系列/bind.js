/** bind特性：
 *  1. 改变this指向,返回一个函数
 *  2. 在调用bind时可以传参,在执行返回函数时，可以再传参
 *  3. 返回函数也能使用new操作符创建对象, 提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。 作为构造函数时，忽略this
 */

var foo = {
  value: 1,
};

function bar(name, age) {
  console.log(this.value, name, age);
}

// 第一版,改变this指向,传参数
Function.prototype.bind1 = function (context) {
  // 此处的this为调用者，就是.bind前的函数
  const self = this;
  // 如下将伪数组转为数组，且去掉第一个参数(传入的this)
  // slice内部对它的this遍历，这里通过call修改slice的this指向,而对象也是可以遍历的，故这里可以转为数组
  const args = Array.prototype.slice.call(arguments, 1);
  return () => {
    // 将arguments伪数组转为数组
    return self.apply(context, args);
  };
};

// const bar1 = bar.bind1(foo,'zx');
// bar1();

// 第二版,执行时传入参数
Function.prototype.bind2 = function (context) {
  const self = this;
  // 这里也可以用es6的 Arrary.from
  const args = Array.prototype.slice.call(arguments, 1);
  // 这里必须用function了,因为箭头函数没有arguments
  return function () {
    const innerArgs = Array.prototype.slice.call(arguments);
    return self.apply(context, args.concat(innerArgs));
  };
};

// const bar1 = bar.bind2(foo, "zx");
// bar1(24);

// 第三版,构造函数效果模拟实现，使用new关键字操作返回函数时，忽略它的this
// 先演示下效果
var value = 2;

var foo1 = {
  value: 1,
};

function bar1(name, age) {
  this.habit = "shopping";
  console.log(this.value);
  console.log(name);
  console.log(age);
}

bar1.prototype.friend = "kevin";
var bindFoo = bar1.bind(foo1, "daisy");

// // 使用new关键字,忽略了其传入的this,在构造函数中this指向实例obj
// var obj = new bindFoo('18'); // undefined daisy 18
// console.log(obj.habit); // shopping
// console.log(obj.friend); // kevin

// 实现
Function.prototype.bind3 = function (context) {
  const self = this;
  const args = Array.prototype.slice.call(arguments, 1);
  function fBound() {
    const innerArgs = Array.prototype.slice.call(arguments);
    // 当作为构造函数使用时，这里的this应该指向实例,这个函数就是一个构造函数,故满足 this instanceof fBound,要往bind前的函数传入this
    // 当作为普通函数时,这里的this应指向window,故不满足 this instanceof fBound
    return self.apply(
      this instanceof fBound ? this : context,
      args.concat(innerArgs)
    );
  }
  // 还有一步,修改返回函数的 prototype 为绑定函数的 prototype，实例就可以继承绑定函数的原型中的值
  // 这里的this指向bind前绑定的函数
  // 不能写成如下,因为修改当修改fBound的prototype时，会直接影响绑定函数的prototype
  // fBound.prototype = this.prototype;
  // 优化，原型链上多一层对象，让this.prototype 作为 实例.__proto__.__proto__
  fBound.prototype = Object.create(this.prototype); // 返回一个函数,其__proto__是传入的对象
  return fBound;
};
var bindFoo1 = bar1.bind3(foo1, "daisy");
var obj = new bindFoo1("18"); // undefined daisy 18
console.log(obj.habit); // shopping
console.log(obj.friend); // kevin

/** 完整版 */
Function.prototype.bind4 = function (context) {
  const self = this; // 这一步不要忘,因为return的函数 this与这里的this不一样,故要保存下来
  const args = Array.from(arguments).slice(1);
  const fnBound = function () {
    const innerArgs = Array.from(arguments);
    return self.apply(
      this instanceof fnBound ? this : context,
      args.concat(innerArgs)
    );
  };
  fnBound.prototype = Object.create(this.prototype);
  return fnBound;
};
