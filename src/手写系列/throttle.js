/** 节流：多次触发，单位时间内执行，首次必然执行，最后一次必然执行
 * 思路：上一次时间和当前时间比对,看是否可以执行
 */
const throttle = (fn, delay) => {
  let timer = null;
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now > last + delay) {
      // 先清楚定时器
      clearTimeout(timer);
      // 执行
      fn.apply(this, args);
      // 更新last
      last = now;
    } else {
      // 最后一次必然执行,那么要开启定时器
      // 单位时间内只能开启一个定时器
      if (timer == null) {
        timer = setTimeout(() => {
          fn.apply(this, args);
          timer = null;
        }, delay);
      }
    }
  };
};
