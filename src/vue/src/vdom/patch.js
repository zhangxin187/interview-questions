// src/vdom/patch.js

// patch用来渲染和更新视图,初次渲染时,oldVnode是el指向的DOM元素，是一个真实DOM, 更新时,oldVnode是一个虚拟节点,旧的虚拟节点
// 返回真实dom
export function patch(oldVnode, vnode) {
  if (!oldVnode) {
    // 组件的挂载流程,组件初次渲染时是没有el属性的,未在options里传
    return createElm(vnode); // 直接生成组件的真实DOM
  }

  // 判断传入的oldVnode是否是一个真实元素
  // 这里很关键  初次渲染 传入的vm.$el就是咱们传入的el选项  所以是真实dom
  // 如果不是初始渲染而是视图更新的时候  vm.$el就被替换成了更新之前的老的虚拟dom

  // dom中元素、空格、注释、文本等都是节点,元素的nodeType为1
  const isRealElement = oldVnode.nodeType;
  // oldVnode是真实dom元素 就代表初次渲染
  if (isRealElement) {
    const el = createElm(vnode); // 根据虚拟节点创造了真实节点
    const parentNode = oldVnode.parentNode;
    parentNode.insertBefore(el, oldVnode.nextSibling);
    parentNode.removeChild(oldVnode);
    return el;
  } else {
    // oldVnode是虚拟dom 就是更新过程 使用diff算法
    if (oldVnode.tag !== vnode.tag) {
      // 如果新旧标签不一致 直接用新的替换旧的 oldVnode.el代表的是真实dom节点--同级比较
      oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
    }

    // 如果旧节点是一个文本节点
    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        oldVnode.el.textContent = vnode.text;
      }
    }

    // 不符合上面两种 代表标签一致 并且不是文本节点
    // 为了节点复用 所以直接把旧的虚拟dom对应的真实dom赋值给新的虚拟dom的el属性
    const el = (vnode.el = oldVnode.el);
    updateProperties(vnode, oldVnode.data); // 更新属性,差异化更新
    const oldCh = oldVnode.children || []; // 老的儿子
    const newCh = vnode.children || []; // 新的儿子
    if (oldCh.length > 0 && newCh.length > 0) {
      // 新老都存在子节点
      updateChildren(el, oldCh, newCh);
    } else if (oldCh.length) {
      // 老的有儿子新的没有
      el.innerHTML = "";
    } else if (newCh.length) {
      // 只有新的有儿子,直接在旧dom上插入新的子dom
      for (let i = 0; i < newCh.length; i++) {
        const child = newCh[i];
        el.appendChild(createElm(child));
      }
    }
    return el;
  }
}

// 判断是否是组件Vnode,内部会实例化组件,编译渲染组件内容
// 子组件实例化、编译渲染,相当于又走了一遍 new Vue({})递归的过程,这样就递归渲染子组件,一层层嵌套递归
function createComponent(vnode) {
  // 初始化组件
  // 创建组件实例
  let i = vnode.data;
  //   下面这句话很关键 调用组件data.hook.init方法进行组件初始化过程($mount)，最终组件的vnode.componentInstance.$el就是组件渲染好的真实dom
  if ((i = i.hook) && (i = i.init)) {
    // 这里是安全写法
    // 实例化组件(_init),手动执行组件$mount方法,compiler、update、patch操作
    i(vnode);
  }

  // 如果组件实例化完毕有componentInstance属性 那证明是组件
  if (vnode.componentInstance) {
    return true;
  }
}

// 虚拟dom转成真实dom 就是调用原生方法生成dom树
// 根据tag创建dom,遍历它的属性,将其添加到dom上
function createElm(vnode) {
  let { tag, data, key, children, text } = vnode;
  // 判断虚拟dom 是元素节点还是文本节点
  // 文本节点是没有tag的,为undefined
  if (typeof tag === "string") {
    // 虚拟dom的el属性指向真实dom

    // 有可能这个vnode是组件虚拟节点,它的tag并不是html标签
    if (createComponent(vnode)) {
      // 如果是组件 返回真实组件渲染的真实dom
      // 子组件渲染完毕,会将真实DOM挂载到$el属性上,故这里直接返回子组件的真实dom即可
      return vnode.componentInstance.$el;
    }

    // 根据标签创建真实DOM
    vnode.el = document.createElement(tag);
    // 解析虚拟dom属性
    updateProperties(vnode);

    // 如果有子节点就递归插入到父节点里面
    // 递归对子节点创建真实DOM，并插入到父节点中，将VNode树转为真实DOM树
    children.forEach((child) => {
      return vnode.el.appendChild(createElm(child));
    });
  } else {
    //   文本节点
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

// 解析vnode的data属性 映射到真实dom上
// 新的有,老的没有,从dom中删除老的,追加新的
// 老的有,新的没有，删除老的
function updateProperties(vnode, oldProps = {}) {
  // for (let key in props) {
  //   el.setAttribute(key, props[key])
  // }
  // 这里的逻辑可能是初次渲染，初次渲染直接用oldProps 给vnode的el复制即可
  // 更新逻辑拿到老的props和vnode里面的data进行比对
  let el = vnode.el;
  let newProps = vnode.data || {};

  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};

  for (let key in oldStyle) {
    // 老的样式有，新的没有，就把页面上的样式删除掉
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }
  // 新旧比对，两个对象如何比对差异
  for (let key in newProps) {
    if (key == "style") {
      for (let key in newStyle) {
        el.style[key] = newStyle[key];
      }
    } else {
      el.setAttribute(key, newProps[key]);
    }
  }
  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key);
    }
  }
}

/** diff */
// 判断两个vnode的标签和key是否相同 如果相同 就可以认为是同一节点就地复用
function isSameVnode(oldVnode, newVnode) {
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
}
// diff算法核心 采用双指针的方式 对比新老vnode的儿子节点
/**
 * @param {*} parent
 * @param {*} oldCh []
 * @param {*} newCh []
 */
function updateChildren(parent, oldCh, newCh) {
  let oldStartIndex = 0; //老儿子的起始下标
  let oldStartVnode = oldCh[0]; //老儿子的第一个节点
  let oldEndIndex = oldCh.length - 1; //老儿子的结束下标
  let oldEndVnode = oldCh[oldEndIndex]; //老儿子的起结束节点

  let newStartIndex = 0; //同上  新儿子的
  let newStartVnode = newCh[0];
  let newEndIndex = newCh.length - 1;
  let newEndVnode = newCh[newEndIndex];

  // 根据key来创建老的儿子的index映射表  类似 {'a':0,'b':1} 代表key为'a'的节点在第一个位置 key为'b'的节点在第二个位置
  function makeIndexByKey(children) {
    let map = {};
    children.forEach((item, index) => {
      map[item.key] = index;
    });
    return map;
  }
  // 生成的映射表
  let map = makeIndexByKey(oldCh);

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 暴力比对时,复用key相同的节点,将节点移到了前面去，然后将原位置置为空，这里要跳过
    if (!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIndex];
    } else if (!oldEndVnode) {
      // 同上
      oldEndVnode = oldCh[--oldEndIndex];
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 从头比对
      // key是否相同
      // 头和头对比 指针后移
      patch(oldStartVnode, newStartVnode); //递归比较儿子以及他们的子节点,文本节点是它们的子节点
      oldStartVnode = oldCh[++oldStartIndex];
      newStartVnode = newCh[++newStartIndex];
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      // 从尾比对
      //尾和尾对比 依次向前追加
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIndex];
      newEndVnode = newCh[--newEndIndex];
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      // 头尾比对
      // 老的头和新的尾相同 把老的头部移动到尾部
      patch(oldStartVnode, newEndVnode);
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); //insertBefore可以移动或者插入真实dom
      oldStartVnode = oldCh[++oldStartIndex];
      newEndVnode = newCh[--newEndIndex];
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      // 尾头比对
      // 老的尾和新的头相同 把老的尾部移动到头部
      patch(oldEndVnode, newStartVnode);
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldCh[--oldEndIndex];
      newStartVnode = newCh[++newStartIndex];
    } else {
      // 上述四种情况都不满足 那么需要暴力对比
      // 根据老的子节点的key和index的映射表 从新的开始子节点进行查找 如果可以找到就进行移动操作 如果找不到则直接进行插入
      let moveIndex = map[newStartVnode.key];
      if (!moveIndex) {
        // 老的节点找不到  直接插入,最后再删除多余的老节点
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      } else {
        let moveVnode = oldCh[moveIndex]; //找得到就拿到老的节点
        oldCh[moveIndex] = undefined; // 这个老节点复用移到了前面去了，将这个位置置为空,避免后续指针移动时重复比对，这里不能删除,删除会影响索引指针
        parent.insertBefore(moveVnode.el, oldStartVnode.el); //把找到的节点移动到最前面
        patch(moveVnode, newStartVnode);
      }
    }
  }

  // 如果老节点循环完毕了 但是新节点还有  证明  新节点需要被添加到头部或者尾部
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 这是一个优化写法 insertBefore的第二个参数是null等同于appendChild作用
      const ele =
        newCh[newEndIndex + 1] == null ? null : newCh[newEndIndex + 1].el;
      parent.insertBefore(createElm(newCh[i]), ele);
    }
  }
  // 如果新节点循环完毕 老节点还有  证明老的节点需要直接被删除
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldCh[i];
      if (child != undefined) {
        parent.removeChild(child.el);
      }
    }
  }
}
