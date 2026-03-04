---
id: other-003
title: TypeScript 常用工具类型及使用场景
difficulty: medium
tags: [typescript, utility-types]
category: other
---

## 🧩 题目

TypeScript 中常用的工具类型（如 `Partial` / `Required` / `Pick` / `Omit` / `ReturnType` 等）分别有什么作用？适用于哪些场景？

---

## 💡 解题思路

1. 按类别解释：属性可选/必选、属性筛选、函数类型相关
2. 给出简单示例代码
3. 补充其他有代表性的工具类型（Readonly、Record、Parameters 等）

---

## ✅ 面试回答（标准版）

1. **`Partial<T>`：将所有属性变为可选**  

```ts
interface User {
  id: number;
  name: string;
  age?: number;
}

type UserPatch = Partial<User>;// { id?: number; name?: string; age?: number; }
```

   - 场景：更新部分字段（如 PATCH 接口的入参）、表单的局部更新对象等。  

2. **`Required<T>`：将所有属性变为必选**  

```ts
type FullUser = Required<User>; 
// { id: number; name: string; age: number; }
```

   - 场景：在某些逻辑中确认已经拿到了完整数据，希望类型上也体现「所有字段都存在」。  

3. **`Pick<T, K>`：从类型中挑选部分属性**  

```ts
type UserPreview = Pick<User, 'id' | 'name'>; 
// { id: number; name: string; }
```

   - 场景：接口只需要返回部分字段；组件只关心某些属性时构造精简的 Props 类型。  

4. **`Omit<T, K>`：从类型中排除部分属性**  

```ts
type UserWithoutId = Omit<User, 'id'>; 
// { name: string; age?: number; }
```

   - 场景：创建新对象时不允许传某个字段（如不允许前端传 id）、组件封装时屏蔽底层组件的某些 props。  

5. **`ReturnType<F>`：获取函数返回值类型**  

```ts
function createUser() {
  return { id: 1, name: 'Tom' };
}

type CreatedUser = ReturnType<typeof createUser>;// { id: number; name: string; }
```

   - 场景：在多个地方使用同一函数返回的结构时，避免重复定义类型，保持单一来源。  

6. **其他常见工具类型（简要）**  
   - `Readonly<T>`：将所有属性设为只读，不允许再赋值。  
   - `Record<K, T>`：构造一个以 K 为键、T 为值的对象类型，例如 `Record<string, number>`。  
   - `Parameters<F>`：获取函数参数类型的元组。  

总结：工具类型本质上是对「类型操作」的高阶封装，能大幅减少重复类型定义，提高类型系统的表达力与可维护性，是日常 TS 开发中非常常用的一类能力。  

