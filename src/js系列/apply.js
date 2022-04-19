/** apply与call类似，区别在于传参，apply接收数组或伪数组，真正执行函数时,函数接收的是一个个参数 */


Function.prototype.apply1 = function (context,args) {
  // 为传第一个参数,this默认指向widnow,严格模式下指向undefined
  context = context || window;
  context.fn = this;
  // 直接从参数上去数组
  const result = context.fn(...args);
  // 删除方法
  delete context.fn;
  return result;
};
