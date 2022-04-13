// src/observer/scheduler.js
// 新建 scheduler.js 文件 表示和调度相关 先同步把 watcher 都放到队列里面去 执行完队列的事件之后再清空队列 主要使用 nextTick 来执行 watcher 队列
import { nextTick } from "../util/next-tick";

// 全局变量
let queue = [];
let has = {}; // 缓存表

function flushSchedulerQueue() {
  for (let index = 0; index < queue.length; index++) {
    //   调用watcher的run方法 执行真正的更新操作
    queue[index].run();
  }
  // 执行完之后清空队列
  queue = [];
  has = {};
}

// 实现异步队列机制
// schedule中有个异步任务队列,当频繁更新同一data时，这个属性会派发多次更新,同一watcher会重复render,故这里缓存,只需要一个watcher进行更新即可,批量更新机制
// 推入队列后，然后执行nextTick异步方法
export function queueWatcher(watcher) {
  const id = watcher.id;
  //   watcher去重
  if (has[id] === undefined) {
    //  同步代码执行 把全部的watcher都放到队列里面去
    queue.push(watcher);
    has[id] = true;
    // 进行异步调用
    // 传入一个回调函数
    nextTick(flushSchedulerQueue);
  }
}
