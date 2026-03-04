---
id: other-008
title: 可复用前端弹窗组件的设计与实现
difficulty: medium
tags: [component, modal, ui]
category: other
---

## 🧩 题目

如果让你实现一个可复用的前端弹窗（Modal/Dialog）组件，你会如何设计？需要支持哪些核心能力（如自定义内容、动画、遮罩、关闭逻辑）？在技术层面如何实现这些能力？

---

## 💡 解题思路

1. 需求拆解：内容插槽、开关控制、遮罩/点击关闭、ESC 关闭、动画、可配置大小/位置
2. 设计 API：props/slots（或 children）、受控/非受控、回调事件
3. 技术实现：Portal/Teleport 挂载到根节点、过渡动画、滚动锁定、ARIA 无障碍

---

## ✅ 面试回答（标准版）

1. **功能与 API 设计**  
   - 核心能力：  
     - 受控开关：`visible` / `open`、`onClose` 回调。  
     - 自定义内容：通过插槽（slot）或 `children` 传入任意 JSX/模板。  
     - 遮罩层、点击遮罩关闭（可配置）和 ESC 关闭。  
     - 动画支持：淡入淡出、缩放等。  
     - 可配置的大小、位置、标题、底部按钮等。  
   - 示例 API（React 风格）：  

   ```tsx
   <Modal
     open={open}
     title="确认删除"
     onClose={handleClose}
     maskClosable={true}
   >
     <p>确认删除该条数据？</p>
   </Modal>
   ```

2. **挂载方式与层级处理**  
   - 使用 Portal（React）或 Teleport（Vue 3）将弹窗挂载到 `body` 下的单独容器中：  
     - 避免被父元素 `overflow: hidden` 或 `z-index` 影响。  
   - 统一管理弹窗层级（z-index）和多个弹窗叠加逻辑。  

3. **遮罩、关闭逻辑与滚动锁定**  
   - 遮罩层：全屏 `div`，背景半透明，位于弹窗下方。  
   - 点击遮罩关闭：在遮罩 `onClick` 时触发 `onClose`（注意阻止事件冒泡到内容区域）。  
   - ESC 关闭：在弹窗打开时绑定 `keydown` 事件监听 ESC，关闭时移除监听。  
   - 滚动锁定：弹窗打开时给 `body` 添加 `overflow: hidden` 或特定类名，避免背景页面滚动。  

4. **动画与过渡**  
   - 使用 CSS 过渡或动画库：  
     - 控制 `opacity` 和 `transform`（如 scale/translate）实现进入/离开动画。  
   - 配合框架内置的过渡组件（如 Vue 的 `<Transition>` 或 React 的 `CSSTransition`）控制挂载/卸载时机。  

5. **无障碍与细节优化（加分点）**  
   - ARIA 属性：  
     - 为弹窗根元素添加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby` 等。  
   - 焦点管理：  
     - 打开弹窗时将焦点移动到弹窗内部第一个可操作元素，关闭时还原到触发按钮。  
   - 提供 Hook 式或命令式 API（如 `Modal.confirm`），方便业务快速调用。  

总结：一个可复用的弹窗组件不仅要满足「能弹出来」这么简单，更重要的是在 API 设计、挂载层级、关闭逻辑、动画体验以及可访问性等方面做到稳健和易用，减少业务方的重复工作。  

