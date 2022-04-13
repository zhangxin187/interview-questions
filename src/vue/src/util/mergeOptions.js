// 定义生命周期
export const LIFECYCLE_HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
];

// 合并策略
const strats = {};

//生命周期合并策略
// 将生命周期合并为数组,mixin的在前
function mergeHook(parentVal, childVal) {
  // 如果有儿子
  if (childVal) {
    if (parentVal) {
      // 合并成一个数组
      return parentVal.concat(childVal);
    } else {
      // 包装成一个数组
      // 只有儿子
      return [childVal];
    }
  } else {
    // 这个已经是数组了,第一次进来包装成Arrary了
    return parentVal;
  }
}

// 为生命周期添加合并策略
LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook;
});

// 为组件添加合并策略,与其他的合并策略不同！！！
// 组件的合并策略是通过原型来继承,即局部组件定义log方法,全局组件也有log方法,此时Vue.options.components 是 局部组件.components的对象原型(__proto__),，先查找自身的,自身查找不到查找继承的,
// 故methods同名,优先使用自身的
// 这里parentVal 和 childVal都是 components对象
strats.components = function (parentVal, childVal) {
  let res = Object.create(parentVal || {});

  if (childVal) {
    // 合并后产生新对象，不用原来的
    for (let key in childVal) {
      res[key] = childVal[key];
    }
  }
  return res;
};

// mixin核心方法
// 这里合并并不是全部的,对于data的合并,可能需要合并data函数的返回值,比较麻烦,深合并,属性冲突时优先用自身的
// 这里的parent可能是Vue.options 或 Sub.options
export function mergeOptions(parent, child) {
  const options = {};
  // 遍历父亲
  for (let k in parent) {
    mergeFiled(k);
  }
  // 父亲没有 儿子有
  for (let k in child) {
    // eslint-disable-next-line no-prototype-builtins
    if (!parent.hasOwnProperty(k)) {
      mergeFiled(k);
    }
  }

  function mergeFiled(k) {
    if (strats[k]) {
      // 特有合并策略,生命周期、组件
      options[k] = strats[k](parent[k], child[k]);
    } else {
      // 默认策略
      // 优先取当前组件的
      options[k] = child[k] ? child[k] : parent[k];
    }
  }
  return options;
}
