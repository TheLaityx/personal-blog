import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin", 10);

  await prisma.user.upsert({
    where: { username: process.env.ADMIN_USERNAME || "admin" },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || "admin",
      password: hashedPassword,
      nickname: "站长",
    },
  });

  const configs = [
    { key: "siteName", value: "の小站" },
    { key: "avatar", value: "/default-avatar.png" },
    { key: "homeWallpaper", value: "" },
    { key: "theme", value: "light" },
  ];

  for (const cfg of configs) {
    await prisma.siteConfig.upsert({
      where: { key: cfg.key },
      update: {},
      create: cfg,
    });
  }

  // 创建示例模块
  const musicModule = await prisma.module.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "音乐",
      description: "我喜欢的音乐与创作",
      sortOrder: 1,
      isActive: true,
    },
  });

  const photoModule = await prisma.module.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "照片墙",
      description: "记录生活中的美好瞬间",
      sortOrder: 2,
      isActive: true,
    },
  });

  const projectModule = await prisma.module.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: "项目",
      description: "我的开源项目与技术实践",
      sortOrder: 3,
      isActive: true,
    },
  });

  const lifeModule = await prisma.module.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      name: "生活",
      description: "日常随笔与感悟",
      sortOrder: 4,
      isActive: true,
    },
  });

  // 音乐模块 - 合集
  const myMusic = await prisma.collection.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "我的创作",
      description: "原创音乐作品",
      moduleId: musicModule.id,
      sortOrder: 1,
    },
  });

  const favMusic = await prisma.collection.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "爱听的歌",
      description: "收藏的好音乐",
      moduleId: musicModule.id,
      sortOrder: 2,
    },
  });

  // 项目模块 - 合集
  const webProject = await prisma.collection.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: "Web 项目",
      description: "前端与全栈项目",
      moduleId: projectModule.id,
      sortOrder: 1,
    },
  });

  // 创建示例文章
  const article1 = await prisma.article.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: "我的第一首原创曲",
      content: "这是我在一个下雨的晚上创作的曲子，灵感来源于窗外的雨滴声。\n\n整首曲子用了简单的钢琴和弦，搭配一些电子音效，营造出一种安静而略带忧伤的氛围。\n\n希望听到这首歌的人，也能感受到那个夜晚的心情。",
      moduleId: musicModule.id,
      collectionId: myMusic.id,
      isPublished: true,
      sortOrder: 1,
    },
  });

  const article2 = await prisma.article.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: "最近循环的十首歌",
      content: "分享一下最近一直在听的十首歌，风格各异但都很好听。\n\n1. The Nights - Avicii\n2. Fix You - Coldplay\n3. 夜曲 - 周杰伦\n4. Blinding Lights - The Weeknd\n5. Levitating - Dua Lipa\n6. 晴天 - 周杰伦\n7. Shape of You - Ed Sheeran\n8. Believer - Imagine Dragons\n9. 七里香 - 周杰伦\n10. Someone Like You - Adele",
      moduleId: musicModule.id,
      collectionId: favMusic.id,
      isPublished: true,
      sortOrder: 1,
    },
  });

  const article3 = await prisma.article.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      title: "春天的樱花",
      content: "今年春天去了武汉看樱花，真的太美了。\n\n粉白色的花瓣随风飘落，整条街道都像是在下花瓣雨。\n\n拍了很多照片，挑了几张最喜欢的放在这里。",
      moduleId: photoModule.id,
      isPublished: true,
      sortOrder: 1,
    },
  });

  const article4 = await prisma.article.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      title: "个人博客网站开发记录",
      content: "用 Next.js + Three.js + Framer Motion 搭建了这个博客，记录一下开发过程中遇到的一些问题和解决方案。\n\nThree.js 的粒子效果花了很长时间调试，主要是要控制好粒子数量，太多了会影响性能。\n\n导航栏的光圈动画用了 Framer Motion 的 spring，手感很顺滑。",
      moduleId: projectModule.id,
      collectionId: webProject.id,
      isPublished: true,
      sortOrder: 1,
    },
  });

  const article5 = await prisma.article.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      title: "一个普通的周末",
      content: "周末起了个大早，去附近的公园跑了五公里。\n\n空气很好，晨光透过树叶洒下来，路上遇到一只橘猫，趴在长椅上晒太阳。\n\n中午吃了火锅，下午在家看了部电影。简单但满足的一天。",
      moduleId: lifeModule.id,
      isPublished: true,
      sortOrder: 1,
    },
  });

  const article6 = await prisma.article.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      title: "无题",
      content: "",
      moduleId: photoModule.id,
      isPublished: true,
      sortOrder: 2,
    },
  });

  // 创建示例评论
  await prisma.comment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      content: "博客设计得很好看！粒子效果很酷",
      author: "路人甲",
      articleId: article4.id,
      isApproved: true,
    },
  });

  await prisma.comment.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      content: "期待更多原创作品！",
      author: "音乐爱好者",
      articleId: article1.id,
      isApproved: true,
    },
  });

  await prisma.comment.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      content: "周杰伦的歌确实经典",
      author: "匿名",
      articleId: article2.id,
      isApproved: true,
    },
  });

  await prisma.comment.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      content: "生活就是需要这样的小确幸",
      author: "周末愉快",
      articleId: article5.id,
      isApproved: true,
    },
  });

  // 一条无文章关联的评论（站点评论）
  await prisma.comment.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      content: "网站整体风格很喜欢，简洁又有高级感",
      author: "访客",
      isApproved: true,
    },
  });

  console.log("Seed completed with demo data");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
