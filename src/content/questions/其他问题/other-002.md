---
id: other-002
title: TypeScript 泛型的核心概念与使用场景
difficulty: medium
tags: [typescript, generics]
category: other
---

## 🧩 题目

TypeScript 中泛型（Generics）的核心概念是什么？泛型常见的使用场景和优势有哪些？如何定义泛型函数、泛型接口或泛型类型别名？

---

## 💡 解题思路

1. 概念：类型参数化，让类型像函数一样可复用
2. 使用场景：容器类（数组、Promise）、工具函数（封装请求、数据转换）、组件 Props 等
3. 语法：`function fn<T>() {}`, `interface Box<T> {}`, `type Result<T> = {...}`

---

## ✅ 面试回答（标准版）

1. **泛型的核心概念**  
   - 泛型可以理解为「**对类型进行参数化**」：不在定义时固定某个具体类型，而是在使用时再传入具体类型参数。  
   - 类似函数的参数，只不过这里的参数是「类型」：  

   ```ts
   function identity<T>(value: T): T {
     return value;
   }

   identity<number>(1);
   identity('hello'); // 类型推断为 string
   ```

2. **常见使用场景与优势**  
   - **容器类型**：如 `Array<T>`、`Promise<T>`，可以容纳任意类型的元素，并在使用时保持类型安全。  
   - **通用工具函数**：  
     - 如封装 HTTP 请求：`request<T>(...): Promise<T>`，调用时传入响应数据类型，获得完整类型提示。  
   - **组件 Props 与 Hook 泛型**：  
     - React/Vue 等框架中，为组件 Props、Hooks 的返回值和参数增加泛型，使调用方能获得准确的类型约束和提示。  
   - 优势：  
     - **复用性**：一套逻辑适用于多种类型。  
     - **类型安全**：相比 `any`，泛型可以在不丢失类型信息的前提下保持灵活性。  

3. **定义泛型函数**  

```ts
function mapArray<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

const res = mapArray([1, 2, 3], x => x.toString()); // 推断为 string[]
```

4. **定义泛型接口与类型别名**  

```ts
// 泛型接口
interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// 泛型类型别名
type Nullable<T> = T | null;

type User = { id: number; name: string };
type UserResponse = ApiResponse<User>;
type NullableUser = Nullable<User>;
```

5. **约束泛型（泛型约束）**  

```ts
function getProp<T extends object, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key];
}
```

   - 通过 `extends` 对类型参数施加约束，使泛型函数内部可以安全地使用某些属性或方法。  

总结：泛型的核心是在「不牺牲类型安全」的前提下提升代码的抽象能力和复用性，是 TypeScript 中非常重要的高级特性之一。  

