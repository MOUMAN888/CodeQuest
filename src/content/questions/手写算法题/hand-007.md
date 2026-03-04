---
id: hand-007
title: 手写实现 LRU 缓存算法
difficulty: medium
tags: [algorithm, lru, cache]
category: algorithm
---

## 🧩 题目

实现一个 LRU（最近最少使用）缓存结构，要求：

1. 构造函数 `LRUCache(capacity)` 指定缓存容量  
2. 支持 `get(key)` / `put(key, value)` 两个操作  
3. 在平均意义上，`get` 和 `put` 的时间复杂度都为 \(O(1)\)  

---

## 💡 解题思路

1. 使用「哈希表 + 双向链表」的经典组合
2. 哈希表提供 \(O(1)\) 查找节点；双向链表维护最近使用顺序，头部为最近使用，尾部为最久未使用
3. `get`：命中则将节点移动到头部，返回值；未命中返回 -1
4. `put`：存在则更新值并移到头部；不存在则在头部插入新节点，若超容量则淘汰尾部节点

---

## ✅ 面试回答（标准版）

1. **数据结构设计**  
   - 使用一个 Map（或普通对象）保存 `key -> 双向链表节点` 的映射。  
   - 双向链表节点结构：`{ key, value, prev, next }`。  
   - 维护一个虚拟的 `head` 和 `tail` 哨兵节点，方便在头尾插入/删除：  
     - 最近使用的节点放在 `head` 后面，最久未使用的节点在 `tail` 前面。  

2. **关键操作**  
   - `moveToHead(node)`：将某节点移动到链表头部（表示最近刚被访问）。  
   - `removeNode(node)`：从链表中删除节点。  
   - `popTail()`：删除链表尾部节点（最久未使用）并返回。  

3. **代码示例（简化实现）**  

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();

    // 虚拟头尾节点
    this.head = { prev: null, next: null };
    this.tail = { prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _addNode(node) {
    // 在 head 之后插入
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _removeNode(node) {
    const { prev, next } = node;
    prev.next = next;
    next.prev = prev;
  }

  _moveToHead(node) {
    this._removeNode(node);
    this._addNode(node);
  }

  _popTail() {
    const node = this.tail.prev;
    this._removeNode(node);
    return node;
  }

  get(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    this._moveToHead(node);
    return node.value;
  }

  put(key, value) {
    let node = this.map.get(key);

    if (node) {
      node.value = value;
      this._moveToHead(node);
    } else {
      node = { key, value, prev: null, next: null };
      this.map.set(key, node);
      this._addNode(node);

      if (this.map.size > this.capacity) {
        const tail = this._popTail();
        this.map.delete(tail.key);
      }
    }
  }
}
```

4. **复杂度分析**  
   - 所有内部操作（查找 Map、移动链表节点）都是 \(O(1)\) 的，  
   - 因此 `get` / `put` 的时间复杂度都为 \(O(1)\)，空间复杂度为 \(O(capacity)\)。  

