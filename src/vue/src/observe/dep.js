// dep和watcher是多对多的关系
// 每个属性都有自己的dep
let id = 0; //dep实例的唯一标识
export default class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 这个是存放watcher的容器
  }
  depend() {
    // 如果当前存在watcher
    if (Dep.target) {
      // Dep.target 是Watcher实例,给Watcher推入当前dep,收集依赖
      // Watcher中addDep会判断dep是否重复,不重复才会收集这个dep,同时dep也会收集这个watcher,这是一个同时的关系,若这个dep在wathcer中重复，那么这个watcher在dep中也是重复的！！！故只需要在Watcher中去重。
      Dep.target.addDep(this); // 把自身-dep实例存放在watcher里面
    }
  }
  notify() {
    //   依次执行subs里面的watcher更新方法
    // 目前来看只有一个Watcher???
    this.subs.forEach((watcher) => watcher.update());
  }

  addSub(watcher) {
    //   把watcher加入到自身的subs容器
    this.subs.push(watcher);
  }
}
// 默认Dep.target为null
Dep.target = null;

// 栈结构用来存watcher
const targetStack = [];

// 可能存在多个Watcher,一个组件一个渲染watcher,多个用户自定义watcher,故通过栈结构来维护
export function pushTarget(watcher) {
  targetStack.push(watcher);
  Dep.target = watcher; // Dep.target指向当前watcher
}
export function popTarget() {
  targetStack.pop(); // 当前watcher出栈 拿到上一个watcher
  Dep.target = targetStack[targetStack.length - 1];
}
