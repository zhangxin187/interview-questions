class Promise1 {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";
  constructor(fn) {
    this.state = Promise1.PENDING;
    // 成功结果or失败原因
    this.data = undefined;
    this.callback = [];

    try {
      fn(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(value) {
    if (this.state === Promise1.PENDING) {
      this.state = Promise1.FULFILLED;
      this.data = value;
      // 判断callback是否有then回调
      // 这里要用forEach,存在多个then回调的情况，也存在一个then和一个finnaly的情况，finally也需要执行,通知他执行完毕了
      this.callback.forEach((item) => {
        item.onFulfilled();
      });
    }
  }

  reject(reason) {
    if (this.state === Promise1.PENDING) {
      this.state = Promise1.REJECTED;
      this.data = reason;
      // 判断callback是否有then回调
      this.callback.forEach((item) => {
        item.onRejected();
      });
    }
  }
}

// 定义then方法
Promise1.prototype.then = function (onFulfilled, onRejected) {
  // 处理then返回值
  // 这里要为箭头函数！
  const handleReutrn = (fn, resolve, reject) => {
    let result = undefined;
    try {
      result = fn(this.data);
    } catch (error) {
      reject(error);
    }

    // 判断then的返回值是否为promise,若为promise则取出它的结果再返回
    if (result instanceof Promise1) {
      result.then(resolve, reject);
    } else {
      resolve(result);
    }
  };

  // 若onFulfilled, onRejected 不是一个函数,将其包装为函数,在下次then中获取这次 这次未获取的结果
  if (typeof onFulfilled !== "function") {
    onFulfilled = function () {
      return this.data;
    };
  }

  // 将其包装为函数,在下次then中获取这次未获取的 错因,一定要throw,这样then返回的promise状态就为rejected,这样下次then就能在第二个回调中拿到错因
  if (typeof onRejected !== "function") {
    onRejected = function () {
      throw this.data;
    };
  }

  return new Promise1((resolve, reject) => {
    if (this.state == Promise1.PENDING) {
      // promise拿到返回值、错误原因可能是异步,then先执行，此时状态为pending,先将其推入队列中，等拿到结果再执行！
      this.callback.push({
        onFulfilled() {
          // 里面逻辑于FUFILLED状态里的一致
          setTimeout(() => {
            handleReutrn(onFulfilled, resolve, reject);
          }, 0);
        },
        onRejected() {
          setTimeout(() => {
            handleReutrn(onRejected, resolve, reject);
          }, 0);
        },
      });
    }

    if (this.state == Promise1.FULFILLED) {
      // promise.then中的回调是微任务,这里通过setTimeout来模拟
      setTimeout(() => {
        handleReutrn(onFulfilled, resolve, reject);
      }, 0);
    }

    if (this.state == Promise1.REJECTED) {
      setTimeout(() => {
        handleReutrn(onRejected, resolve, reject);
      }, 0);
    }
  });
};

// 实现catch
Promise1.prototype.catch = function (onRejected) {
  // 直接调用then
  return this.then(undefined, onRejected);
};

// 实现Promise.race
// race传递promise数组,返回执行最快的promise的结果,剩下的promise不再执行，返回的是一个promise
Promise1.race = function (promises) {
  return new Promise1((resolve, reject) => {
    promises.forEach((promise) => {
      // 返回的promise执行态一旦转移,就不可逆了，后面的resolve、reject不管用
      promise.then(
        (data) => resolve(data),
        (err) => reject(err)
      );
    });
  });
};

// var p1 = new Promise1((resolve, reject) => {
//   setTimeout(() => {
//     resolve("one");
//   }, 500);
// });

// var p2 = new Promise1(function (resolve, reject) {
//   setTimeout(() => {
//     resolve("two");
//   }, 400);
// });

// Promise1.race([p1, p2]).then(function (value) {
//   console.log(1, value); // "two"
//   // 两个都完成，但 p2 更快
// });

// 实现Promise.all
// 入参: promise数组,若参数不是promise,则会将其包装为promise,  返回值: promise, promise的结果 数组 or 第一个失败reason
// 注意： 返回的结果数组要按入参顺序排列,而不是由调用 promise 的完成顺序决定。
Promise1.all = function (promises) {
  return new Promise1((resolve, reject) => {
    let res = Array(promises.length);
    for (let i = 0; i < promises.length; i++) {
      // 若为非promise，将其包装为promise
      Promise.resolve(promises[i]).then(
        (value) => {
          res[i] = value;
          if (res.length == promises.length) {
            return resolve(res);
          }
        },
        (reason) => {
          return reject(reason);
        }
      );
    }
  });
};

// var p1 = Promise.resolve(3);
// var p2 = 1337;
// var p3 = new Promise1((resolve, reject) => {
//   setTimeout(() => {
//     // resolve(123);
//     reject("err");
//   }, 400);
// });

// Promise.all([p3, p1, p2])
//   .then((values) => {
//     console.log(values);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// 实现Promise.resolve
// 若参数是非promise,将其包装为promise,返回的promose执行态是fulfilled；
// 若参数是promise,则直接返回,返回promise的执行态取决于这个promise的结果

Promise1.resolve = function (p) {
  if (p instanceof Promise1) {
    return p;
  }
  return new Promise1((res) => {
    res(p);
  });
};

// const p1 = Promise1.resolve(111);
// p1.then((d) => {
//   console.log("d", d);
// });

// const p2 = new Promise1((res, rej) => {
//   rej("err999");
// });

// Promise1.resolve(p2).then(
//   () => {},
//   (e) => {
//     console.log("e", e);
//   }
// );

// 实现Promise.reject
// 比Promise.resolve简单，仅返回rejected的状态的promise,即使参数是个promise,也会将其包一层
Promise1.reject = function (p) {
  return new Promise1((_, rej) => {
    rej(p);
  });
};

// 实现Promise.prototype.finally
// 在promise结束时，无论结果是fulfilled或者是rejected，都会执行指定的回调函数。
Promise1.prototype.finally = function (fn) {
  this.then(fn, fn);
};
// const p1 = Promise1.resolve(111);
// p1.then((d) => {
//   console.log("d", d);
// })
//   .catch((err) => {
//     console.log("e", err);
//   })
//   .finally(() => {
//     console.log("finally");
//   });

// 实现Promise.any
// Promise.any 只要有一个promise成功，就返回它的结果； 当所有promise都失败，则抛出一个错误
// 与race的区别： race是只有有一个promise有结果就返回，无论成功or失败
Promise1.any = function (promises) {
  let failNum = 0;
  return new Promise1((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      Promise1.resolve(promises[i]).then(
        (data) => {
          return resolve(data);
        },
        () => {
          // 失败1次+1
          failNum++;
          if (failNum === promises.length) {
            reject("AggregateError: All promises were rejected");
          }
        }
      );
    }
  });
};

const p1 = new Promise1((resolve, reject) => {
  reject("总是失败");
});

const p2 = new Promise1((resolve, reject) => {
  setTimeout(() => {
    resolve("1 success");
  }, 500);
});

Promise.any([p1, p2,3])
  .then((d) => {
    console.log("d", d);
  })
  .catch((err) => {
    console.log(err);
  });
