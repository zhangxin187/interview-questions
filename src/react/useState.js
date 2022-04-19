// 通过workInProgressHook变量始终指向当前正在工作的hook。
let workInProgressHook;

// 判断时mount or update
let isMount = true;

// hook存放在对应的fiber节点上,一个组件会有多个hook,故这里存放为hook链表
// 产生状态更新时，会生成update结构，多个update组成单向环状链表，在class组件中update存放在updateQueue中，在函数组件中存放在hook中
const fiber = {
  // 存放hook链表
  memoizedState: null,
  stateNode: App,
};

// 模拟调度Scheduler
// 在shcdule里会调用函数组件，进入render阶段
function schedule() {
  // 更新前将workInProgressHook重置为fiber保存的第一个Hook
  workInProgressHook = fiber.memoizedState;

  // 执行函数组件,触发组件render
  const app = fiber.stateNode();
  // 置为update阶段
  isMount = false;
  return app;
}

// 调用更新state的方法内部实际调用dispatchAction
// queue === fiber.hook.queue === fiber.updateQueue(class组件中)
// action 更新state的函数
// 作用：更新state时会调用，创建update对象，添加在fiber.hook.queue.pending上,组成单向环状链表,并触发schedule进行调度
function dispatchAction(queue, action) {
  const update = {
    action,
    next: null,
  };

  if (queue.pending === null) {
    // queue.pending不存在update
    // 多个update会构成单向环状链表，这里仅有一个update，也要与自己构成环状链表
    update.next = update;
  } else {
    // queue.pending上已存在环状链表,此次新加入的update要插入到环状链表的最后
    // queue.pending指向环状链表的最后一个节点,queue.pending.next则指向第一个节点
    // 要将此次update插入环状链表,且作为最后一会节点
    // 1. 先将自己的next指针指向第一个节点  2. 再让最后一个节点的next指针指向自己
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  // update存放在 fiber.memorizeState(hook).queue.pending上
  // queue.pending指向update链表的最后一个节点
  queue.pending = update;

  // 此时已经生成了update对象,放到了fiber节点的hook.queue.pending上了,此时需要触发schedule调度机制,后续render
  schedule();
}

// 当调用更新state的方法时,会触发函数重新执行,故useState也会再次执行,此时isMount为false,update阶段
function useState(initialState) {
  // useState生成hook
  let hook;

  if (isMount) {
    hook = {
      queue: {
        pending: null,
      },
      // 存放state
      memoizedState: initialState,
      next: null, // 指向下一个hook
    };

    // 判断fiber上是否存在hook
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook;
    } else {
      // 将当前hook链接到已有的hook之后,引用数据，同时会更新到fiber.memorizeState中
      workInProgressHook.next = hook;
    }

    // 指向当前hook,即hook链表最后一个hook
    workInProgressHook = hook;
  } else {
    // update阶段
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next;
  }

  // 当前hook的state
  let baseState = hook.memoizedState;

  if (hook.queue.pending) {
    // 这里已经进入了render阶段,遍历updateQueue,计算state
    let firstUpdate = hook.queue.pending.next;

    // 执行多个update,这里不考虑优先级调度相关
    do {
      // 计算state
      const action = firstUpdate.action;
      baseState = action(baseState);
      // 指针后移
      firstUpdate = firstUpdate.next;
    } while (firstUpdate !== hook.queue.pending); // 最后一个update执行完后跳出循环

    // update执行完后,清空queue.pending
    hook.queue.pending = null;
  }

  // 更新hook上的state
  hook.memoizedState = baseState;

  // 调用useState返回state和更新state的方法,在useState中
  // 通过调用dispatchAction来生成update对象, hook.queue === updateQueue
  // 当触发更新后,这里返回更新后的state
  return [baseState, dispatchAction.bind(null, hook.queue)];
}

// 模拟组件
function App() {
  const [num, updateNum] = useState(0);
  const [flag, setFlag] = useState(false);

  console.log(`${isMount ? "mount" : "update"} num: `, num, flag);

  return {
    click() {
      updateNum((num) => num + 1);
    },
    set() {
      setFlag((flag) => !flag);
    },
  };
}

const app = schedule();
app.click();
app.set();
app.set();
