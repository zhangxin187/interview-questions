// const arr2 = [0, 1, 2, [[[3, 4]]]];

// console.log(arr2.flat());
/**
 * flat() 方法会按照一个可指定的深度递归遍历数组，并将所有元素与遍历到的子数组中的元素合并为一个新数组返回。
 * */

// 实现思路: 递归

// 手动实现
// 1.reduce+concat
// reduce记录最终的结果,还是需要递归
var arr1 = [1, 2, 3, [1, 2, 3, 4, [2, 3, 4]]];
function flatDeep(arr, d = 1) {
  return d > 0
    ? arr.reduce(
        (acc, val) =>
          acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val),
        []
      )
    : arr.slice();
}
flatDeep(arr1, Infinity);

// forEach + 递归
const eachFlat = (arr = [], depth = 1) => {
  const result = []; // 缓存递归结果

  // 开始递归
  (function flat(arr, depth) {
    // forEach 会自动去除数组空位
    arr.forEach((item) => {
      // 控制递归深度
      if (Array.isArray(item) && depth > 0) {
        // 递归数组
        flat(item, depth - 1);
      } else {
        // 缓存元素
        result.push(item);
      }
    });
  })(arr, depth);

  // 返回递归结果
  return result;
};

// 3. for of 实现,与forEach差不多
// for of 循环不能去除数组空位，需要手动去除
const forFlat = (arr = [], depth = 1) => {
  const result = [];

  (function flat(arr, depth) {
    for (let item of arr) {
      if (Array.isArray(item) && depth > 0) {
        flat(item, depth - 1);
      } else {
        // 去除空元素，添加非undefined元素
        item !== undefined && result.push(item);
      }
    }
  })(arr, depth);

  return result;
};
