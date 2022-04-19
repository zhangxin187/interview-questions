/** 模拟实现new */
function Otaku(name, age) {
  this.name = name;
  this.age = age;

  this.habit = "Games";
}

// 因为缺乏锻炼的缘故，身体强度让人担忧
Otaku.prototype.strength = 60;

Otaku.prototype.sayYourName = function () {
  console.log("I am " + this.name);
};

// var person = new Otaku("Kevin", "18");

// console.log(person.name); // Kevin
// console.log(person.habit); // Games
// console.log(person.strength); // 60

// person.sayYourName(); // I am Kevin

/** new做了如下:
 *  1. 创建一个对象
 *  2. 让构造函数中的this指向这个对象
 *  3. 执行构造函数中的代码，给这个对象添加属性和方法
 *  4. 返回这个对象,不需要我们手动return
 */
// 传入构造函数
const createObject1 = function (Fn) {
  // 1. 创建一个对象
  const obj = {};
  // 获取属性
  const args = Array.from(arguments).slice(1);
  // 2. 构造函数中this指向obj,执行构造函数
  Fn.apply(obj, args);
  // 3.链接原型,在对象当中可以访问构造函数的属性和方法
  obj.__proto__ = Fn.prototype;
  // 4.返回这个对象
  return obj;
};

var person = createObject1(Otaku, "Kevin", "18");
console.log(person.name); // Kevin
console.log(person.habit); // Games
console.log(person.strength); // 60

person.sayYourName(); // I am Kevin

// 优化: new 构造函数时,若构造函数有返回值,若这个返回值是一个对象，则new 构造函数的返回值是这个对象，若这个返回值是基本数据类型，则new 构造返回的是创建的实例对象
// 一般不要直接操作__proto__,可以使用Object.setPrototypeOf

// 完整版
const createObject2 = function (Fn) {
  // 1. 创建一个对象
  const obj = {};
  // 获取属性
  const args = Array.from(arguments).slice(1);
  // 2. 构造函数中this指向obj,执行构造函数
  const result = Fn.apply(obj, args);
  // 3.链接原型,在对象当中可以访问构造函数的属性和方法
  Object.setPrototypeOf(obj, Fn.prototype);
  // 我们还需要判断返回的值是不是一个对象，如果是一个对象，我们就返回这个对象，如果不是，我们该返回什么就返回什么。
  return typeof result == "object" ? result : obj;
};
