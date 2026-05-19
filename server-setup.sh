#!/bin/bash
# 个人博客服务器一键部署脚本
# 适用于：Ubuntu 22.04 + 阿里云韩国首尔轻量服务器
# 域名：俗序.top

set -e

BLOG_DIR="/var/www/blog"
DOMAIN="俗序.top"

echo "=========================================="
echo "  个人博客一键部署脚本"
echo "  域名: $DOMAIN"
echo "=========================================="

# 1. 更新系统
echo "[1/8] 更新系统..."
apt update && apt upgrade -y

# 2. 安装必要工具
echo "[2/8] 安装必要工具..."
apt install -y curl git nginx certbot python3-certbot-nginx

# 3. 安装 Node.js 20 + pnpm + pm2
echo "[3/8] 安装 Node.js 20..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
npm install -g pnpm pm2

# 4. 创建项目目录
echo "[4/8] 创建项目目录..."
mkdir -p $BLOG_DIR
mkdir -p /var/log/blog
mkdir -p /var/backups

# 5. 克隆代码（如果目录为空）
echo "[5/8] 拉取代码..."
cd $BLOG_DIR
if [ ! -f "package.json" ]; then
    git clone https://github.com/TheLaityx/personal-blog.git .
fi

# 6. 安装依赖并构建
echo "[6/8] 安装依赖并构建..."
pnpm install
pnpm build

# 7. 配置环境变量
echo "[7/8] 配置环境变量..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="$(openssl rand -base64 32)"
ADMIN_USERNAME=1398693816
ADMIN_PASSWORD_HASH=2004suxupcwl
EOF
    echo "已生成 .env 文件，JWT_SECRET 已随机生成"
else
    echo ".env 已存在，跳过"
fi

# 8. 配置 Nginx
echo "[8/8] 配置 Nginx..."
cat > /etc/nginx/sites-available/blog << 'EOF'
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
EOF

ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 9. 启动 PM2
echo "[启动] PM2 服务..."
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

pm2 start ecosystem.config.js || pm2 restart personal-blog
pm2 save
pm2 startup systemd

# 10. 创建更新脚本
cat > deploy.sh << 'EOF'
#!/bin/bash
cd /var/www/blog
git pull origin master
pnpm install
pnpm build
pm2 restart personal-blog
echo "部署完成: $(date)"
EOF
chmod +x deploy.sh

echo ""
echo "=========================================="
echo "  基础部署完成！"
echo "=========================================="
echo ""
echo "当前状态:"
echo "  - Nginx: $(systemctl is-active nginx)"
echo "  - PM2:"
pm2 status
echo ""
echo "下一步（等域名实名认证通过后执行）:"
echo "  1. 在阿里云 DNS 添加 A 记录指向本服务器 IP"
echo "  2. 运行: certbot --nginx -d 俗序.top -d www.俗序.top"
echo "  3. 访问 https://俗序.top 验证"
echo ""
echo "后续更新命令: ./deploy.sh"
echo ""
