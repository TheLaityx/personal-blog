# 个人博客部署指南 —— 俗序.top + 阿里云韩国首尔轻量服务器

## 当前状态

- **服务器**：阿里云韩国首尔轻量应用服务器（已购买）
- **域名**：`俗序.top`（实名认证审核中，暂停解析）
- **项目**：Next.js + Prisma + SQLite

---

## 阶段一：等待域名实名认证（1-3天，同时可做阶段二）

`.top` 域名不需要备案，但必须完成**域名实名认证**后才能解析使用。审核期间无法添加 DNS 解析记录。

**现在能做的：**
- 配置服务器环境（阶段二）
- 上传代码、构建项目（阶段三）
- 配置 Nginx（阶段四）

**必须等认证通过后才能做：**
- 添加 DNS 解析记录（阶段五）
- 申请 SSL 证书（阶段六）

---

## 阶段二：连接服务器并配置环境

### 1. 获取服务器信息

在阿里云控制台查看：
- **公网 IP**（例如 `203.0.113.10`）
- **root 密码**（重置密码后保存）

### 2. 配置防火墙

阿里云控制台 → 轻量应用服务器 → 你的实例 → **防火墙**

添加规则：

| 协议 | 端口 | 操作 |
|------|------|------|
| TCP | 22 | 允许（SSH，默认已有） |
| TCP | 80 | 允许（HTTP） |
| TCP | 443 | 允许（HTTPS） |
| TCP | 3000 | 允许（Next.js 开发端口，可选） |

### 3. SSH 连接服务器

Windows 用 PowerShell / Git Bash：

```bash
ssh root@你的服务器IP
# 输入密码
```

### 4. 安装 Node.js + pnpm + PM2

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 安装 Node.js 20 LTS
nvm install 20
nvm use 20
node -v  # v20.x.x
npm -v

# 安装 pnpm + pm2
npm install -g pnpm pm2
```

### 5. 安装 Nginx + Certbot

```bash
apt install nginx certbot python3-certbot-nginx -y
```

---

## 阶段三：部署 Next.js 博客

### 1. 创建项目目录

```bash
mkdir -p /var/www/blog
cd /var/www/blog
```

### 2. 上传代码

**方式 A：Git 克隆（推荐，方便后续更新）**

```bash
git clone https://github.com/TheLaityx/personal-blog.git .
```

**方式 B：SCP 手动上传**

本地 Windows PowerShell 执行：

```bash
scp -r F:/personal-blog/* root@你的服务器IP:/var/www/blog/
```

### 3. 安装依赖并构建

```bash
cd /var/www/blog
pnpm install
pnpm build
```

> 如果构建时内存不足，先添加 swap（见阶段八 Q3）。

### 4. 配置环境变量

```bash
cp .env.example .env
nano .env
```

写入：

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="你的强密码-必须修改"
ADMIN_USERNAME=1398693816
ADMIN_PASSWORD_HASH=2004suxupcwl
```

> ⚠️ 务必把 `JWT_SECRET` 改成随机强密码！

### 5. 用 PM2 启动服务

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'personal-blog',
    script: './node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/blog',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/blog/err.log',
    out_file: '/var/log/blog/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

mkdir -p /var/log/blog
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

> `pm2 startup` 后按提示运行生成的命令。

### 6. 验证

```bash
pm2 status
curl http://localhost:3000
```

---

## 阶段四：配置 Nginx 反向代理

### 1. 创建站点配置

```bash
nano /etc/nginx/sites-available/blog
```

写入：

```nginx
server {
    listen 80;
    server_name 俗序.top www.俗序.top;

    location /_next/static {
        alias /var/www/blog/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location /uploads {
        alias /var/www/blog/public/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. 启用配置

```bash
ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## 阶段五：域名解析（实名认证通过后）

### 1. 添加 DNS 记录

阿里云控制台 → 域名 → `俗序.top` → **解析设置**

添加两条 A 记录：

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| @ | A | 你的服务器公网IP | 600 |
| www | A | 你的服务器公网IP | 600 |

### 2. 验证解析生效

```bash
ping 俗序.top
```

通常 **几分钟到几小时** 生效。

---

## 阶段六：配置 HTTPS（域名解析生效后）

### 申请 Let's Encrypt 免费证书

```bash
certbot --nginx -d 俗序.top -d www.俗序.top
```

按提示操作：
1. 输入邮箱（证书到期提醒）
2. 同意条款
3. 是否共享邮箱给 EFF（可选）
4. **选择 2：自动重定向 HTTP → HTTPS**

### 验证自动续期

```bash
certbot renew --dry-run
```

---

## 阶段七：验证上线

访问：
- `https://俗序.top` → 博客首页
- `https://俗序.top/admin` → 管理后台

---

## 阶段八：后续维护

### 一键更新脚本

```bash
cat > /var/www/blog/deploy.sh << 'EOF'
#!/bin/bash
cd /var/www/blog
git pull origin master
pnpm install
pnpm build
pm2 restart personal-blog
echo "部署完成: $(date)"
EOF
chmod +x /var/www/blog/deploy.sh
```

以后更新：`./deploy.sh`

### 常见问题

**Q1: 图片不显示？**
```bash
chmod -R 755 /var/www/blog/public/uploads
```

**Q2: 内存不足？**
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

**Q3: 查看日志？**
```bash
pm2 logs personal-blog
tail -f /var/log/nginx/error.log
```

**Q4: 数据库备份？**
```bash
cp /var/www/blog/prisma/dev.db /var/backups/blog-db-$(date +%Y%m%d).db
```

---

_部署完成后，你的博客就正式上线了！🎉_
