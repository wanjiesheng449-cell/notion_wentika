import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './env.js';
import { listTasks, getTask, createTask, updateTask } from './notionClient.js';

const app = express();
const PORT = env.PORT;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * DEBUG ENDPOINT: Test Notion Authentication
 * GET /api/debug/notion-auth
 * 测试 Notion API 鉴权是否成功
 */
app.get('/api/debug/notion-auth', async (req: Request, res: Response) => {
    try {
        console.log('🔍 Testing Notion auth with token:', env.NOTION_TOKEN.substring(0, 10) + '...');

        // 调用 Notion API 的 /v1/users/me 端点测试鉴权
        const response = await fetch('https://api.notion.com/v1/users/me', {
            headers: {
                'Authorization': `Bearer ${env.NOTION_TOKEN}`,
                'Notion-Version': '2022-06-28',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                status: response.status,
                error: data,
                hint: response.status === 401
                    ? '❌ Token is invalid. Make sure you are using the "Internal Integration Secret" from https://www.notion.so/my-integrations'
                    : 'Notion API returned an error'
            });
        }

        return res.json({
            success: true,
            message: '✅ Notion authentication successful!',
            user: data,
            tokenInfo: {
                length: env.NOTION_TOKEN.length,
                prefix: env.NOTION_TOKEN.substring(0, 10) + '...'
            }
        });

    } catch (error) {
        console.error('Error testing Notion auth:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/tasks
 * 获取所有任务列表
 */
app.get('/api/tasks', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tasks = await listTasks();
        res.json(tasks);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/tasks/:id
 * 获取单个任务详情
 */
app.get('/api/tasks/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const task = await getTask(id);
        res.json(task);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/tasks
 * 创建新任务
 * Body: { title: string, status?: string }
 */
app.post('/api/tasks', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, status } = req.body;

        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
        }

        const task = await createTask({ title: title.trim(), status });
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/tasks/:id
 * 更新任务
 * Body: { title?: string, status?: string }
 */
app.patch('/api/tasks/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, status } = req.body;

        if (!title && !status) {
            return res.status(400).json({ error: 'At least one field (title or status) must be provided' });
        }

        const updateData: any = {};
        if (title !== undefined) {
            if (typeof title !== 'string' || title.trim() === '') {
                return res.status(400).json({ error: 'Title must be a non-empty string' });
            }
            updateData.title = title.trim();
        }
        if (status !== undefined) {
            updateData.status = status;
        }

        const task = await updateTask(id, updateData);
        res.json(task);
    } catch (error) {
        next(error);
    }
});

// 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err.message);

    if (err.message.includes('Invalid status value')) {
        return res.status(400).json({ error: err.message });
    }

    if (err.message.includes('Failed to fetch') || err.message.includes('Failed to create') || err.message.includes('Failed to update')) {
        return res.status(500).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error' });
});

// 404 处理
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   GET    /health`);
    console.log(`   GET    /api/debug/notion-auth`);
    console.log(`   GET    /api/tasks`);
    console.log(`   GET    /api/tasks/:id`);
    console.log(`   POST   /api/tasks`);
    console.log(`   PATCH  /api/tasks/:id`);
});
