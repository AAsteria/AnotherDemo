# OrangeMind 冲刺模块 Demo

可点击的网页原型，用 HTML + CSS + TypeScript 展示橙知（OrangeMind）“考前 3 天冲刺”流程，从上传资料到学习节点、练习、错题本、模拟考与庆祝收尾。

## 使用方式
1. 确保环境有全局 `tsc`（TypeScript 编译器）。本环境已预装，可直接运行 `tsc`。  
2. 在仓库根目录执行：
   ```bash
   tsc
   ```
   生成的浏览器脚本位于 `dist/main.js`。
3. 打开 `index.html` 即可体验点击演示（可直接用浏览器打开本地文件，或用任意静态服务器托管）。

> 提示：`package.json` 中的 `start` 依赖 `npx serve`，若本地无该工具可 `npm install -g serve`。
