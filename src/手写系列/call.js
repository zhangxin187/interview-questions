/** call 改变函数this指向,且传入参数 */

var foo = {
  value: 1,
};

function bar(name, age) {
  console.log(this.value, name, age);
}

// bar.call(foo); // 1

// 模拟实现
// 实际上就是将绑定的函数挂到传入的this上,在调用完毕后,再将其删除
// 类比如上,讲绑定函数添加到foo1
var foo1 = {
  value: 1,
  bar() {
    console.log(this.value);
  },
};

// 版本1,改变this指向，执行函数
// 箭头函数用惯了,一定要改，注意this问题
Function.prototype.call1 = function (context) {
  // 将调用call的函数挂在传入的this上
  context.fn = this;
  // fn执行时,this指向context
  const result = context.fn();
  // 删除方法
  delete context.fn;
  return result;
};
// bar.call1(foo);

// 版本2 支持传参数
Function.prototype.call1 = function (context) {
  context.fn = this;
  // 拿到参数
  const args = Array.from(arguments).slice(1);
  // 将参数传给调用的函数
  const result = context.fn(...args);
  // 删除方法
  delete context.fn;
  return result;
};
bar.call1(foo, "zx", 19);

// 上面传参用的es6,在es6之前用如下实现
/*
var args = [];
// 拿到所有参数
for(var i = 1, len = arguments.length; i < len; i++) {
    args.push('arguments[' + i + ']');
}
// 执行后 args为 ["arguments[1]", "arguments[2]", "arguments[3]"]
// 这里 args 会自动调用 Array.toString() 这个方法,转为 'arguments[1],arguments[2],arguments[3]'
eval('context.fn(' + args +')');
 */


// 完整版
Function.prototype.call1 = function (context) {
    // 为传第一个参数,this默认指向widnow,严格模式下指向undefined
    context = context || window;
    context.fn = this;
    // 拿到参数
    const args = Array.from(arguments).slice(1);
    // 将参数传给调用的函数
    const result = context.fn(...args);
    // 删除方法
    delete context.fn;
    return result;
  };