import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取 __dirname 的 ES Module 等价方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 明确指定 .env 文件路径（从 src/ 向上一级到 server/，再找 .env）
const envPath = path.resolve(__dirname, '../.env');
console.log(`📝 Loading .env from: ${envPath}`);

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('❌ Failed to load .env file:', result.error);
    throw new Error('Failed to load .env file');
}

// 导出清洗后的环境变量（去除空格和不可见字符）
export const env = {
    NOTION_TOKEN: (process.env.NOTION_TOKEN || '').trim(),
    NOTION_DATABASE_ID: (process.env.NOTION_DATABASE_ID || '').trim(),
    PORT: Number(process.env.PORT || 3001),
};

// 验证必需的环境变量
if (!env.NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN is missing in .env file');
    throw new Error('Missing NOTION_TOKEN in environment variables');
}

if (!env.NOTION_DATABASE_ID) {
    console.error('❌ NOTION_DATABASE_ID is missing in .env file');
    throw new Error('Missing NOTION_DATABASE_ID in environment variables');
}

// 打印调试信息（不泄露完整 token）
console.log('✅ .env file loaded successfully');
console.log(`🔑 NOTION_TOKEN loaded: length=${env.NOTION_TOKEN.length}, prefix=${env.NOTION_TOKEN.substring(0, 10)}...`);
console.log(`📊 NOTION_DATABASE_ID loaded: ${env.NOTION_DATABASE_ID}`);
console.log(`🚪 PORT: ${env.PORT}`);
