/** 实现柯里化的包装函数
 *  柯里化是一种将使用多个参数的一个函数转换成一系列使用一个参数的函数的技术
 *  通过柯里化包装函数,会得到一个函数,可以接着传参... 直接到实参和形参个数相等,执行最终的函数！
 */

const fn = (name, age, sex) => {
  console.log(`我的姓名${name}，我的年龄${age},我的性别${sex}`);
};

// 简易版
// 不存在递归性,只适用单层
const curry1 = function (fn) {
  const args = Array.from(arguments).slice(1);
  return function () {
    fn.apply(this, args.concat(Array.from(arguments)));
  };
};
// const fn1 = curry1(fn, "zx");
// fn1(24, "male");
// const fn2 = curry1(fn);
// fn2("zx", 24, "male");

// 改造,根据实参是否等于传入参数长度来决定是否执行函数
// 利用闭包+递归
const curry2 = function (fn) {
  // 实参长度
  const length = fn.length;
  const args = Array.from(arguments).slice(1);
  return function () {
    const allArgs = args.concat(Array.from(arguments));
    if (allArgs.length >= length) {
      // 真正执行fn
      return fn.apply(this, allArgs);
    } else {
      // 返回函数，不执行真正的函数,收集参数
      return curry2(fn, ...allArgs);
    }
  };
};
// const fn1 = curry2(fn);
// fn1("zx")(23)("male");

// 实现占位
let holder = [];
const curry3 = function (fn) {
  // 实参长度
  const length = fn.length;
  const args = Array.from(arguments).slice(1);
  return function () {
    let allArgs = args.concat(Array.from(arguments));
    // 遍历所有参数,是否存在占位
    // 这里每次都会重复推入占位符,要去重
    allArgs.forEach((item, index) => {
      if (item == "_" && !holder.includes(index) && index < length)
        holder.push(index);
    });

    if (allArgs.length > length) {
      // 多余的参数
      const rest = allArgs.length - length;
      // 占位回填
      for (let i = 0; i < holder.length; i++) {
        const arg = allArgs[length + rest - 1];
        // 多余的参数也是位符,不回填
        if (arg !== "_") {
          allArgs[holder[i]] = arg;
          holder.splice(i, 1);
        }
        allArgs.splice(length + rest - 1, 1);
        i--;
        if(allArgs.length == length ) break;
      }
    }

    // 再check一遍allArgs是否有占位符
    allArgs.forEach((item, index) => {
      if (item == "_" && !holder.includes(index) && index < length)
        holder.push(index);
    });

    // 当无占位且参数长度等于函数参数长度
    if (allArgs.length >= length && !holder.length) {
      // 真正执行fn
      return fn.apply(this, allArgs);
    } else {
      // 返回函数，不执行真正的函数,收集参数
      return curry3(fn, ...allArgs);
    }
  };
};
const fn1 = curry3(fn);
fn1("zx", "_","_")(23,)("male");
