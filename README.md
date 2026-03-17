# 钱多多 - uni-app 项目

## 项目结构
```
qian-duo-duo/
├── src/
│   ├── pages/
│   │   ├── index/
│   │   │   └── index.vue      # 首页（持仓列表）
│   │   ├── add/
│   │   │   └── add.vue        # 新增/编辑持仓
│   │   ├── login/
│   │   │   └── login.vue      # 登录页面
│   │   ├── stats/
│   │   │   └── stats.vue      # 统计图表页
│   │   ├── settings/
│   │   │   └── settings.vue   # 设置页
│   │   └── notification/
│   │       └── notification.vue # 消息通知页
│   ├── utils/
│   │   ├── storage.js         # 本地存储工具
│   │   ├── api.js             # 基金数据接口
│   │   ├── cloud.js           # 云函数调用工具
│   │   ├── user.js            # 用户状态管理
│   │   ├── sync.js            # 数据同步工具
│   │   └── notification.js    # 消息通知工具
│   ├── static/                # 静态资源
│   ├── App.vue                # 应用入口
│   ├── main.js                # 入口文件
│   ├── manifest.json          # 应用配置
│   ├── pages.json             # 页面路由配置
│   └── uni.scss               # 全局样式变量
├── index.html                 # H5入口
├── vite.config.js             # Vite配置
└── package.json
```

## 技术栈
- Vue 3
- uni-app
- SCSS
- Vite
- 微信云开发

## 启动方式

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
# H5
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# 支付宝小程序
npm run dev:mp-alipay
```

### 构建
```bash
# H5
npm run build:h5

# 微信小程序
npm run build:mp-weixin

# 支付宝小程序
npm run build:mp-alipay
```

## 功能说明

### 已完成
- [x] 首页持仓列表展示
- [x] 新增/编辑持仓
- [x] 删除持仓
- [x] 本地数据存储
- [x] 基金数据搜索
- [x] 实时估值获取
- [x] 收益率计算
- [x] 毛玻璃UI效果
- [x] 用户登录（微信小程序云开发）
- [x] 云端数据同步
- [x] 统计图表页
- [x] 设置页
- [x] 消息通知

### 功能详情

#### 用户登录
- 支持微信小程序一键登录
- H5端模拟登录（开发测试）
- 登录状态持久化

#### 云端数据同步
- 自动同步持仓数据到云端
- 支持手动同步
- 多端数据共享

#### 统计图表
- 累计收益展示
- 收益分布图
- 收益排行榜
- 今日表现统计

#### 设置页
- 用户信息展示
- 数据同步管理
- 数据导出/清除
- 通知设置

#### 消息通知
- 每日收益报告
- 收益波动提醒
- 免打扰时段设置

## 注意事项

1. **微信小程序 AppID**：需要在 `manifest.json` 中配置
2. **云开发环境ID**：需要在 `App.vue` 中配置 `env: 'your-env-id'`
3. **基金API**：目前使用天天基金接口，小程序端需配置合法域名
4. **H5跨域**：本地开发时可能需要配置代理

## 更新日志

### v1.0.0 (2026-03-16)
- 初始化项目
- 完成基础UI和功能
- 完成用户登录功能
- 完成云端数据同步
- 完成统计图表页
- 完成设置页
- 完成消息通知功能
