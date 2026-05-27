# 雅雅 (Yaya) App 技术文档

## 概述

| 项目 | 内容 |
|------|------|
| **名称** | 雅雅 (Yaya) |
| **版本** | 1.0.1 |
| **包名** | `com.yaya.app` |
| **构建工具** | Vite + React 19 + Capacitor 6 |

---

## 技术栈

- **前端框架**：React 19 + React DOM
- **构建工具**：Vite 8
- **移动框架**：Capacitor 6（Android）
- **样式**：原生 CSS（CSS Variables）
- **Android minSdk**：22 | **targetSdk**：34

---

## 项目结构

```
yaya/
├── src/
│   ├── main.jsx          # React 入口
│   ├── App.jsx           # 根组件，路由/更新检查
│   ├── styles.css        # 全局样式
│   ├── pages/
│   │   ├── HomePage.jsx  # 首页
│   │   ├── JKPage.jsx    # JK概率
│   │   └── IntelPage.jsx # 情报雷达
│   ├── components/       # (预留)
│   └── hooks/            # (预留)
├── dist/                 # 打包输出
├── android/              # Capacitor Android 项目
├── capacitor.config.json
└── package.json
```

---

## 页面说明

### 1. HomePage (`/`)
主菜单页，两个功能入口：JK概率、情报雷达。

### 2. JKPage (`/jk`)
JK概率投票工具。

**API 调用**：
- `GET http://121.196.229.11/api/submissions` — 获取已提交列表（直接返回数组）
- `POST http://121.196.229.11/api/submit` — 提交新投票

**提交请求体**：
```json
{ "name": "名字", "probability": 50 }
```

**提交响应**（成功时）：
```json
{ "data": { "submission": { "id": "...", "name": "...", "probability": "...", "createdAt": 1779... } } }
```

**数据格式**（每条）：
```json
{ "id": "sub_xxx", "name": "帆", "probability": "100.0", "createdAt": 1779027353508 }
```

**已知 bug 记录**：
- v1.0.1 build 6 之前：代码写 `d.submission`，但服务端返回 `d.data.submission`，导致提交后列表不追加更新

### 3. IntelPage (`/intel`)
情报雷达，展示科技/生活/管理/招商局四类情报。

**API 调用**：
- `GET http://121.196.229.11/raw/?limit=50` — 获取情报列表

**响应格式**：
```json
{ "records": [{ "id": "...", "title": "...", "summary": "...", "link": "...", "agent": "feishu_product", "source": "...", "pub_date": "..." }], "total": 2414 }
```

**分类逻辑**：
| Tab | 筛选条件 |
|-----|----------|
| 全部 | 不过滤 |
| 🚀 科技 | `agent === 'feishu_product'` |
| 🌿 生活 | `agent === 'feishu_co' && source === '股市直击'` |
| 💼 管理 | `agent === 'feishu_cio'` |
| 🏢 招商 | `agent === 'wuzhao'` |

---

## Android 配置

### AndroidManifest.xml 关键属性
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="true"
    ...>
```

### network_security_config.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">121.196.229.11</domain>
        <trust-anchors>
            <certificates src="@raw/ca_cert"/>
        </trust-anchors>
    </domain-config>
</network-security-config>
```
（`ca_cert.der` 为服务器自签名 CA 证书）

### 权限
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

---

## 构建命令

```bash
# Web 构建
npm run build

# 同步到 Android
npx cap sync android

# 构建 APK（需 JAVA_HOME + ANDROID_HOME）
cd android && ./gradlew assembleDebug

# APK 输出路径
android/app/build/outputs/apk/debug/app-debug.apk
```

### 本地环境要求
- **Java**：OpenJDK 17+
- **Android SDK**：build-tools 34.0.0、platform-tools、platforms/android-34
- **Gradle**：8.2.1（wrapper）
- **Capacitor CLI**：6.2.1

---

## 版本更新机制

App 启动时从 `http://121.196.229.11/yaya/version.json` 获取版本信息，与 `APP_VERSION` 比较，决定是否提示更新。

```json
{
  "version": "1.0.1",
  "build": 10,
  "url": "https://121.196.229.11/yaya/yaya.apk",
  "releaseNotes": "改用HTTP，修复网络错误"
}
```

---

## 服务器端（ECS）

| 地址 | 说明 |
|------|------|
| `121.196.229.11` | ECS 公网 IP |
| `http://121.196.229.11/api/submissions` | JK 提交列表 |
| `http://121.196.229.11/api/submit` | JK 提交接口 |
| `http://121.196.229.11/raw/` | 情报 API |
| `http://121.196.229.11/yaya/` | APK + version.json |
| `127.0.0.1:3008` | jk-probability 服务 |
| `127.0.0.1:3009` | intelligence-api 服务 |

---

## 版本历史

| Build | 日期 | 说明 |
|-------|------|------|
| 1-5 | 早期 | 含 `d.submission` bug，APK 闪退 |
| 6 | 05-23 | 从零重建 Android 项目 |
| 7 | 05-23 | 添加 CA 证书信任 |
| 8 | 05-23 | AndroidManifest 声明 networkSecurityConfig |
| 9 | 05-23 | 加 `usesCleartextTraffic="true"` |
| 10 | 05-23 | **改用 HTTP**（彻底绕过证书问题） |

---

## 服务器端部署要求

### 服务器信息

- **公网 IP**：`121.196.229.11`
- **Node.js 版本**：`v20.20.2`
- **进程管理**：PM2
- **Web 服务器**：nginx（端口 80/443/8080）

### 必须在线的服务

| PM2 服务名 | 端口 | 作用 |
|-----------|------|------|
| `jk-server` | 3008 | 提供 `/api/submissions` 和 `/api/submit` |
| `intelligence-api` | 3009 | 提供 `/raw/` 情报接口 |
| nginx | 80 | 反向代理 + 托管静态文件 |

### nginx 路由配置

```nginx
server {
    listen 80 default_server;
    server_name 121.196.229.11;
    root /var/www/jk-probability;

    # 雅雅 APK 静态文件
    location /yaya/ {
        alias /var/www/yaya/;
        try_files $uri $uri/ /yaya/index.html;
    }

    # 情报 API
    location /raw/ {
        proxy_pass http://127.0.0.1:3009/api/intelligence;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        add_header Access-Control-Allow-Origin * always;
    }

    # JK API
    location /api/ {
        proxy_pass http://127.0.0.1:3008;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'Content-Type';
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 文件目录

```
/var/www/yaya/
├── yaya.apk          # APK 安装包
└── version.json      # 版本信息

/var/www/jk-probability/   # jk-server 工作目录
/var/www/intelligence-api/ # intelligence-api 工作目录
```

### 服务管理命令

```bash
# 查看服务状态
pm2 status

# 重启 JK 服务
pm2 restart jk-server

# 重启情报服务
pm2 restart api_server

# 重启 nginx
nginx -t && systemctl restart nginx
```

### 健康检查

```bash
# 检查端口监听
ss -tlnp | grep -E ':80|:3008|:3009'

# 检查 API 是否响应
curl http://121.196.229.11/api/submissions
curl http://121.196.229.11/raw/?limit=2
```