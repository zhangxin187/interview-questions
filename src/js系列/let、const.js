// 我们知道用let,会产生块级作用域,那么转为es5时,代码时怎么实现的呢？
// 其实js能产生作用域的就只有两个，一个是全局作用域，一个是函数作用域
// 说白了，产生的块级作用域转为es5其实就是一个函数作用域

var funcs = [];
for (let i = 0; i < 10; i++) {
  funcs[i] = function () {
    console.log(i);
  };
}
funcs[0](); // 0


// es5 babse编译为
var funcs = [];

var _loop = function _loop(i) {
    funcs[i] = function () {
        console.log(i);
    };
};

for (var i = 0; i < 10; i++) {
    _loop(i);
}
funcs[0](); // 0


// TDZ
// {} 两个大括号并不一定是空对象,还可能是代码块
 {   
     console.log(a)   
     let a = 123;
 }

 // babel编译
 // 如下是伪代码,将变量改名,这样就访问不到,报错
 {
    console.log(a);   
    var _a = 123;
 }

 // const重复命名报错,是在编译层完成的
 const a = 123;
 a = 123;

 // babel
 // babel编译时,会创建错误函数,const声明的变量可能通过一个方式 存储下来,当有地方给const变量赋值时,直接调用错误函数报错就行了,这是在编译层面做的
 function _readOnlyError(name) {
    throw new TypeError('"' + name + '" is read-only');
  }
  
  var a = 123;
  123, _readOnlyError("a");


  // 有了let、const后,let、const声明的变量都会放到「词法环境」中去,而var声明的都被放入到「变量环境」中去
  // 代码执行过程分为两步：1.进入代码执行上下文,创建变量对象   2.执行代码
  // 在进入代码执行上下文时，会创建响应的词法环境，词法环境中的变量通过栈的形式维护
  
  

