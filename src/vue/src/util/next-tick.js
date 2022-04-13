// src/util/next-tick.js

let callbacks = [];
let pending = false;

function flushCallbacks() {
  pending = false; //把标志还原为false
  // 依次执行回调
  for (let i = 0; i < callbacks.length; i++) {
    callbacks[i]();
  }
}

// 定义一个异步方法,该方法内的回调异步执行(微任务),包装为微任务优先
let timerFunc; //定义异步方法  采用优雅降级

// 逐步降级的过程
if (typeof Promise !== "undefined") {
  // 如果支持promise
  const p = Promise.resolve();
  // 将flushCallbacks作为微任务
  timerFunc = () => {
    p.then(flushCallbacks);
  };
} else if (typeof MutationObserver !== "undefined") {
  // 微任务
  // MutationObserver 主要是监听dom变化 也是一个异步方法
  let counter = 1;
  // 观察者,节点发生变化后 会执行这个回调flushCallbacks
  const observer = new MutationObserver(flushCallbacks);
  // 创建一个文本节点
  const textNode = document.createTextNode(String(counter));
  // 观察这个文本节点内容是否发生变化
  observer.observe(textNode, {
    characterData: true,
  });

  // 执行timerFunc时,让文本节点发生了变化,会执行创建实例时的回调,这个回调是一个异步任务
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
} else if (typeof setImmediate !== "undefined") {
  // 如果前面都不支持 判断setImmediate 
  // node中的宏任务
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  // 最后降级采用setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}

// 调用多次nextTick只会执行一次,等任务队列(callback)清空后才会执行本次的任务队列,一段时间内清空任务队列
// nextTick使用 promise、MutationOberserve、setImediate、setTimeout将回调包装为一个异步任务，promise和Oberserve是微任务,后面就是EventLoop的知识了
// nextTick也有执行顺序的,比如我们操作data更新,data更新是同步的,而重新render是异步，也是通过nextTick实现，我们可以通过nextTick拿到更新后的dom,此时nextTick在执行render回调,这时pending为true,等render执行完毕,才执行我们的回调
export function nextTick(cb) {
  // 除了渲染watcher  还有用户自己手动调用的nextTick 一起被收集到数组
  callbacks.push(cb);

  // 首次执行立即触发
  if (!pending) {
    // 如果多次调用nextTick  只会执行一次异步 等异步队列清空之后再把标志变为false
    pending = true;
    timerFunc();
  }
}
