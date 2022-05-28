// 基础版本,
// 原理： 超过一定时间,会reject掉promise,不再关心它后面请求拿到的结果,并没有终止掉promise,只是提前让它返回结果; 需要借助一个promise，包装函数来聚合promise来race
// 利用setTimeout + race
// 入参传入request函数,在timeoutWrapper中调用

function timeoutWrapper(request, timeout = 1000) {
  const wait = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("请求超时");
    }, timeout);
  });
  return Promise.race([request(), wait]);
}

// 使用
// timeoutWrapper(request).then(
//   (d) => {
//     console.log(d);
//   },
//   (e) => {
//     console.log(e);
//   }
// );

// 不过这种方式并不灵活，因为终止 promise 的原因可能有很多，例如当用户点击某个按钮或者出现其他事件时手动终止。所以应该写一个包装函数，提供 abort 方法，让使用者自己决定何时终止：
// 在外部可以调个方法,来中断这个promise
function abortWrapper(request) {
  let abort;
  // 将reject方法通过闭包传出去,在外部来调用,让promise的状态迁移到Rejected
  let p1 = new Promise((resolve, reject) => (abort = reject));
  let p = Promise.race([request(), p1]);
  p.abort = abort;
  return p;
}

// 模拟请求
const request = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("请求成功啦");
    }, 3000);
  });
};

const p = abortWrapper(request);
p.then(
  (d) => {
    console.log(d);
  },
  (e) => {
    console.log(e);
  }
);

setTimeout(() => {
  p.abort("请求失败了");
}, 2000);
