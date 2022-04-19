// 节流: 多次连续触发只会执行最后一次
// 使用input搜索
/** 思路: 定时器,每次执行先关闭之前的定时器，在开启新的定时器，到了时间才会执行 */
const debounce = (fn, delay, immediate) => {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    if (immediate && !timer) {
      // 每次调用,首次立即执行
      fn.apply(this, args);
      immediate = false;
    }

    timer = setTimeout(() => {
      // 箭头函数即成上下文this
      fn.apply(this, args);
    }, delay);
  };
};

const debounceFn = debounce(
  () => {
    // ...
  },
  300,
  true
);
