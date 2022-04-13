Array.prototype.reduce1 = function (fn, init) {
  if (typeof fn !== "function") {
    throw new TypeError("第一个参数必须为函数");
  }
  //this指向方法的调用者,即数组实例
  if (!Array.isArray(this)) {
    throw new TypeError("该方法的只能用于数组");
  }
  let index = 0;
  //判断是否传入初值
  //当没有传入初值,则令数组中的第一个元素为初值,current为第二个元素
  if (init == "undefined") {
    index = 1;
    init = this[0];
  }
  //累加器的值
  let accumulator = init;
  //遍历
  for (let i = index; i < this.length; i++) {
    //拿到返回值,再作为下一次调用的第一个参数
    accumulator = fn(accumulator, this[i], i, this);
  }
  //遍历完,将最后一次执行fn的返回值作为终值返回出去
  return accumulator;
};

let arr = [1, 2, 3, 4];
console.log(
  arr.reduce((pre, cur) => {
    return pre + cur;
  })
);
