# 1Token - API Token 保险库

<!-- 徽章区域 -->
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-0.1.0-orange)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19-blue?logo=prisma)

> 一句话简介：为开发者提供一个安全、便捷的本地 API Token 管理工具，解决「Token 分散、易过期、难管理」的痛点。
>
> One-liner: A secure, local-first API Token manager for developers, solving the pain of scattered, expiring, and hard-to-manage tokens.

## 📖 目录 / Table of Contents

- [功能特性 / Features](#-功能特性--features)
- [技术栈 / Tech Stack](#-技术栈--tech-stack)
- [快速开始 / Quick Start](#-快速开始--quick-start)
- [CLI 使用指南](#-cli-使用指南)
- [安全架构](#-安全架构)
- [项目结构](#-项目结构)
- [开发路线图](#-开发路线图)
- [贡献指南](#-贡献指南)
- [许可证 / License](#-许可证--license)

## ✨ 功能特性 / Features

### 核心功能 / Core Features

- 🔐 **端到端加密**：采用 AES-256-GCM 加密算法，Token 在数据库中始终以密文存储
- 🎯 **Master Password 验证**：bcrypt 哈希 + salt，密码永不落库
- 📋 **一键复制**：Token 默认遮蔽显示，点击或复制时自动解密
- 🏷️ **标签分类**：支持 Prod、Test、CI/CD 等标签，快速筛选
- 🔍 **实时搜索**：按平台、用途、标签进行模糊搜索
- ⏰ **过期提醒**：Token 过期前 7 天自动发送邮件提醒
- 🌙 **暗黑模式**：完整支持明/暗主题切换，系统主题自动检测
- 💾 **本地存储**：SQLite 数据库，轻量易备份，数据完全本地化

### CLI 工具 / CLI Tool

- 🚀 **快速获取**：`1token get <platform>` 一键调取 Token 并复制到剪贴板
- 📋 **列出所有**：`1token list` 查看所有 Token 状态
- 🖥️ **跨平台支持**：macOS (pbcopy) / Linux (xclip) / Windows (clip)

## 🛠 技术栈 / Tech Stack

### 核心栈 / Core Stack

| 类别 | 技术 | 说明 |
|------|------|------|
| **Frontend/Backend** | Next.js 15 (App Router) | 全栈框架，Server Actions 处理业务逻辑 |
| **UI 组件** | Shadcn UI + Tailwind CSS | 现代、极简设计 |
| **数据库** | SQLite (via Prisma ORM) | 本地化存储，轻量易备份 |
| **加密** | Node.js `crypto` (AES-256-GCM) | 端到端加密 |
| **任务调度** | node-cron | 本地定时任务 |
| **邮件服务** | Resend API | 简洁的邮件发送服务 |

### 开发工具 / Dev Tools

| 工具 | 用途 |
|------|------|
| **包管理** | pnpm |
| **类型检查** | TypeScript 5 |
| **代码规范** | ESLint + Prettier |
| **测试** | Vitest + Playwright |

## 📦 快速开始 / Quick Start

### 前置要求 / Prerequisites

- Node.js 18+ 
- pnpm 8+

### 安装步骤 / Installation

```bash
# 1. 克隆项目
git clone https://github.com/AiKiAi-stack/1Token.git
cd 1Token

# 2. 安装依赖
pnpm install

# 3. 生成 Prisma 客户端
pnpm db:generate

# 4. 推送数据库 Schema
pnpm db:push

# 5. 启动开发服务器
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 可用脚本 / Available Scripts

```bash
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器
pnpm lint             # 运行代码检查
pnpm db:generate      # 生成 Prisma 客户端
pnpm db:push          # 推送数据库 Schema
pnpm db:studio        # 打开 Prisma Studio
pnpm cli:build        # 编译 CLI 工具
pnpm cli:dev          # 开发模式运行 CLI
```

## 💻 CLI 使用指南

### 安装 / Installation

CLI 工具已包含在项目中，无需单独安装。

### 基本用法 / Basic Usage

```bash
# 获取指定平台的 Token 并复制到剪贴板
pnpm cli:dev get github
pnpm cli:dev get "AWS"
pnpm cli:dev get pypi

# 列出所有 Token
pnpm cli:dev list
pnpm cli:dev ls

# 查看帮助
pnpm cli:dev help
```

### 编译为可执行文件 / Build Executable

```bash
# 编译 CLI
pnpm cli:build

# 使用编译后的 CLI
./cli/dist/index.js get github
```

### 跨平台剪贴板支持 / Clipboard Support

| 平台 | 工具 | 安装方式 |
|------|------|----------|
| macOS | pbcopy | 系统自带 |
| Linux | xclip / xsel | `sudo apt install xclip` |
| Windows | clip | 系统自带 |

## 🔐 安全架构

### 加密流程 / Encryption Flow

1. **Token 存储**：
   - 用户输入 Token 明文
   - 使用 Master Password 派生密钥（PBKDF2 + scrypt）
   - AES-256-GCM 加密后存储为 Base64 密文
   - 加密参数（iv, authTag, salt）与密文一同存储

2. **Token 解密**：
   - 用户输入 Master Password
   - 使用存储的 salt 重新派生密钥
   - 内存中解密，永不落盘
   - 复制到剪贴板后自动清除

### 安全最佳实践 / Security Best Practices

1. **Master Password 不落库**：仅存储 bcrypt 哈希，派生密钥存于 Session
2. **前端遮蔽**：Token 默认显示 `********`，点击/复制时解密
3. **加密时机**：Token 在服务端加密后入库，解密仅在内存中进行
4. **Session 过期**：用户登出或 Session 过期后立即销毁派生密钥
5. **日志脱敏**：禁止记录任何 Token 明文

## 📁 项目结构

```
1token/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   ├── dashboard/          # 主界面
│   ├── login/              # 登录页
│   └── layout.tsx          # 根布局
├── cli/                    # CLI 命令行工具
│   ├── dist/               # 编译输出
│   ├── index.ts            # CLI 入口
│   └── tsconfig.json       # CLI TypeScript 配置
├── components/             # React 组件
│   ├── ui/                 # Shadcn 基础组件
│   ├── token/              # Token 相关组件
│   └── layout/             # 布局组件
├── lib/                    # 工具函数
│   ├── crypto.ts           # 加密/解密
│   ├── auth.ts             # 认证逻辑
│   └── db.ts               # Prisma 客户端
├── prisma/                 # 数据库
│   ├── schema.prisma       # Schema 定义
│   └── dev.db              # SQLite 数据库
├── scripts/                # 脚本
│   └── expiry-reminder.ts  # 过期提醒任务
└── tests/                  # 测试文件
```

## 🗺 开发路线图

### Phase 1: 核心保险库 (MVP) ✅

- [x] 项目初始化
- [x] 安全架构实现
- [x] Token CRUD 功能

### Phase 2: 智能管理体验 ✅

- [x] 可视化状态指示
- [x] 标签系统与搜索
- [x] 权限清单记录

### Phase 3: 自动化提醒 ✅

- [x] 邮件系统集成
- [x] 后台扫描任务
- [x] 安全审计日志

### Phase 4: 开发者体验增强 ✅

- [x] 导出功能（.env 格式）
- [x] 暗黑模式
- [x] CLI 桥接工具

## 🤝 贡献指南 / Contributing

欢迎贡献！请遵循以下流程：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发环境设置 / Setup Development Environment

```bash
git clone https://github.com/AiKiAi-stack/1Token.git
cd 1Token
pnpm install
pnpm db:generate
pnpm db:push
pnpm dev
```

### 代码规范 / Code Style

- 使用 Prettier 格式化代码
- 遵循 ESLint 规则
- 编写有意义的提交信息

## 📄 许可证 / License

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

<div align="center">

**Made with ❤️ by AiKiAi-stack**

[⬆ 返回顶部](#1token---api-token-保险库)

</div>
