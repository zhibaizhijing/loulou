# 微信小程序设计规范 · 精简版

> **This document is authoritative for all UI/UX code generation in this
> repository.** When Claude generates or reviews any UI-related code
> (WXML / WXSS / TS components / pages), the output MUST conform to every
> constraint below. If the design source (JSX prototypes, claude.ai
> Design System project, or user request) conflicts with these rules,
> **stop and ask the user for approval before diverging**.

---

## 尺寸与布局

- 设计稿基准：**750 × 1334 px**，此时 `1px = 1rpx`
- 全局使用 **rpx** 作为响应式单位，**不要用 px 定宽**
- 导航栏高度：**128rpx**
- 底部 Tab 栏高度：**98rpx**（仅当启用时）
- 栅格系统：**24 列**，基准 750px 下每列 37.5px

## 触控与交互

- 最小触控区域：**75 × 75px**
- 适老化要求：交互元素周围增加 **12pt 触控热区**（约 16px）
- 按钮状态必须包含：默认、按压、禁用、加载 四种状态
- 次级页面必须保留左上角返回按钮

## 字体

- 标题 / 导航栏 / 列表标题：**34px**
- 摘要 / 小按钮文字：**28px**
- 消息列表时间 / 昵称：**24px**
- Tab 文字 / 时间：**20px**
- 正文推荐：**16px**

## 页面与组件限制

- 单页面节点数 **≤ 1000**，超出会导致性能问题
- 底部 Tab 栏必须同时包含 **图标 + 文字**，数量 2–5 个
- 轮播图比例：**16:9**
- 分享缩略图比例：**5:4**
- 滚动控件内部 **不能放置视频**
- 弹窗层级 **不能高于** 导航栏和 Tab 栏

## 适老化（2025+ 审核重点）

- 字体需跟随微信系统设置等比放大
- 文本与背景对比度 **≥ 4.5:1**（WCAG AA 级）
- 元素间保持至少 **2A 间距**，避免相邻可点击区域过近

---

## 检查要点（用于 Claude 审查设计）

当用户提供设计方案或代码时，请依据上述规范检查：

1. 是否使用了正确尺寸基准（750px）和单位（rpx）
2. 所有可点击元素是否满足最小触控区域要求
3. 底部 Tab 栏是否满足图标+文字
4. 页面节点数是否预估可控
5. 适老化三要素：字体跟随、对比度、间距

---

## Enforcement rules for Claude

- **Before writing WXSS/WXML**: verify every dimension, font size, and touch
  target against this document. If a design source specifies a value that
  violates a rule (e.g. a 40rpx tap target), stop and ask before proceeding.
- **Before finishing a task**: run through the 5 检查要点 above as a
  self-review checklist. Note any violations in the end-of-turn summary.
- **When importing pixel values from JSX prototypes**: convert to rpx
  using `1px ≈ 2rpx` on the 750 baseline. Do not paste raw px values
  from React CSS.
- **If a design mock uses px-defined widths, non-standard tab-bar
  height, or violates the 弹窗层级 rule**: flag it explicitly and
  request approval before implementing.

If the design output conflicts with any rule here, escalate to the
user for approval — do not silently deviate.
