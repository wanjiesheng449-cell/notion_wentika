import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// 获取 __dirname 的 ES Module 等价方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 尝试加载 .env 文件（本地开发用），但在生产环境（如 Render）中不强制要求
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    console.log(`📝 Loading .env from: ${envPath}`);
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.error('❌ Failed to load .env file:', result.error);
        throw new Error('Failed to load .env file');
    }
    console.log('✅ .env file loaded successfully');
} else {
    console.log('📝 No .env file found, using environment variables from process.env (production mode)');
}

// 导出清洗后的环境变量（去除空格和不可见字符）
export const env = {
    NOTION_TOKEN: (process.env.NOTION_TOKEN || '').trim(),
    NOTION_DATABASE_ID: (process.env.NOTION_DATABASE_ID || '').trim(),
    PORT: Number(process.env.PORT || 3001),
};

// 验证必需的环境变量
if (!env.NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN is missing in environment variables');
    throw new Error('Missing NOTION_TOKEN in environment variables');
}

if (!env.NOTION_DATABASE_ID) {
    console.error('❌ NOTION_DATABASE_ID is missing in environment variables');
    throw new Error('Missing NOTION_DATABASE_ID in environment variables');
}

// 打印调试信息（不泄露完整 token）
console.log('✅ Environment variables loaded successfully');
console.log(`🔑 NOTION_TOKEN loaded: length=${env.NOTION_TOKEN.length}, prefix=${env.NOTION_TOKEN.substring(0, 10)}...`);
console.log(`📊 NOTION_DATABASE_ID loaded: ${env.NOTION_DATABASE_ID}`);
console.log(`🚪 PORT: ${env.PORT}`);
