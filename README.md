# Personal Blog

一个现代化的双端个人博客网站，展示端与管理后台一体化。

**版本**: v1.0

---

## 特性

- **展示端**: Three.js 粒子背景、磨砂玻璃自定义鼠标、导航栏水滴光圈动画、蛇形排列模块卡片、滚动联动生长曲线、评论系统、深浅主题切换
- **管理后台**: JWT 登录、模块 CRUD、合集管理、文章发布（富文本 + 媒体占位符 + 封面）、评论审核、站点设置（壁纸 / 头像 / 名称）、模块排序
- **数据库**: SQLite + Prisma ORM，零配置部署

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 + React 18 + TypeScript |
| 样式 | Tailwind CSS |
| 3D / 动画 | Three.js (@react-three/fiber) + Framer Motion |
| ORM | Prisma 6.19.3 |
| 数据库 | SQLite |
| 认证 | bcryptjs + JWT |
| 图标 | lucide-react |

---

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/TheLaityx/personal-blog.git
cd personal-blog
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境变量

复制 `.env.example` 为 `.env`（或自行创建），填入以下内容：

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret"
ADMIN_USERNAME="your-admin-username"
ADMIN_PASSWORD="your-admin-password"
```

### 4. 初始化数据库

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)

管理后台：[http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 项目结构

```
prisma/
  schema.prisma    # 数据库模型定义
  seed.ts          # 示例数据
src/
  app/
    page.tsx            # 首页
    module/[id]/        # 模块详情
    article/[id]/       # 文章详情
    comments/           # 评论页
    admin/              # 管理后台
    api/                # REST API
  components/
    NavBar.tsx              # 导航栏 + 光圈动画
    ParticleBackground.tsx  # Three.js 粒子
    CustomCursor.tsx        # 磨砂玻璃鼠标
    ModuleCard.tsx          # 模块卡片
```

---

## 构建生产版本

```bash
npm run build
npm start
```

---

## 截图
<img width="2543" height="1326" alt="image" src="https://github.com/user-attachments/assets/d51206d9-95a6-451e-bcbe-34520a651de3" />

<img width="2537" height="1315" alt="image" src="https://github.com/user-attachments/assets/8f341c2c-4c01-4c9e-b3db-0c25eb9d4620" />



## License

MIT
