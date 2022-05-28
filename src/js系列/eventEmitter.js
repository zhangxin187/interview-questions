// 手写发布订阅模式 EventEmitter
class EventEmitter {
  constructor() {
    // 一个订阅者,可能有多个回调,key value形式,key为type,value为回调数组
    this.events = {};
  }

  // 实现订阅,将回调推入数组中去
  // 根据函数callback来确定具体的订阅者
  on(type, callBack) {
    if (!this.events) this.events = {};

    if (!this.events[type]) {
      this.events[type] = [callBack];
    } else {
      this.events[type].push(callBack);
    }
  }

  // 删除订阅
  // 删除具体的某个回调，这里也可以删除整个订阅者
  // delete this.events.type,不用delete的话,重新构建map即可
  off(type, callBack) {
    if (!this.events[type]) return;
    this.events[type] = this.events[type].filter((item) => {
      return item !== callBack;
    });
  }

  // 只执行一次订阅事件
  once(type, callBack) {
    // 改写callback,在回调内部添加off方法,执行一次就将其干掉了
    function fn() {
      callBack();
      this.off(type, fn);
    }
    this.on(type, fn);
  }

  // 触发事件
  emit(type, ...rest) {
    this.events[type] &&
      this.events[type].forEach((fn) => fn.apply(this, rest));
  }
}
// 使用如下
const myEvent = new EventEmitter();

const handle = (...rest) => {
  console.log(rest);
};
myEvent.on("click", handle);

myEvent.emit("click", 1, 2, 3, 4);

myEvent.off("click", handle);

myEvent.emit("click", 1, 2);

myEvent.once("dbClick", () => {
  console.log(123456);
});
myEvent.emit("dbClick");
myEvent.emit("dbClick");
