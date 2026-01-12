import { Client } from '@notionhq/client';
import { PageObjectResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints.js';
import { NOTION_PROPERTIES, DEFAULT_VALUES, isValidStatus, NotionStatus } from './notionSchema.js';
import { env } from './env.js';

// 使用清洗后的环境变量初始化 Notion 客户端
const notion = new Client({
    auth: env.NOTION_TOKEN,
});

const databaseId = env.NOTION_DATABASE_ID;

export interface Task {
    id: string;
    title: string;
    status: string;
    updatedAt: string;
    type?: string;
    color?: string;
    icon?: string;
}

export interface CreateTaskInput {
    title: string;
    status?: string;
}

export interface UpdateTaskInput {
    title?: string;
    status?: string;
}

/**
 * 从 Notion Page 对象转换为 Task 对象
 */
function pageToTask(page: PageObjectResponse): Task {
    const properties = page.properties;

    // 提取标题
    let title = 'Untitled';
    const titleProp = properties[NOTION_PROPERTIES.TITLE];
    if (titleProp?.type === 'title' && titleProp.title.length > 0) {
        title = titleProp.title[0].plain_text;
    }

    // 提取状态
    let status = DEFAULT_VALUES.STATUS;
    const statusProp = properties[NOTION_PROPERTIES.STATUS];
    if (statusProp?.type === 'status' && statusProp.status?.name) {
        status = statusProp.status.name;
    }

    return {
        id: page.id,
        title,
        status,
        updatedAt: page.last_edited_time,
        type: DEFAULT_VALUES.TYPE,
        color: DEFAULT_VALUES.COLOR,
        icon: DEFAULT_VALUES.ICON,
    };
}

/**
 * 列出所有任务
 */
export async function listTasks(): Promise<Task[]> {
    try {
        const response: QueryDatabaseResponse = await notion.databases.query({
            database_id: databaseId,
            sorts: [
                {
                    timestamp: 'last_edited_time',
                    direction: 'descending',
                },
            ],
        });

        return response.results
            .filter((page): page is PageObjectResponse => 'properties' in page)
            .map(pageToTask);
    } catch (error) {
        console.error('Error listing tasks from Notion:', error);
        throw new Error('Failed to fetch tasks from Notion');
    }
}

/**
 * 获取单个任务详情
 */
export async function getTask(pageId: string): Promise<Task> {
    try {
        const page = await notion.pages.retrieve({ page_id: pageId });

        if (!('properties' in page)) {
            throw new Error('Invalid page response');
        }

        return pageToTask(page as PageObjectResponse);
    } catch (error) {
        console.error(`Error fetching task ${pageId}:`, error);
        throw new Error('Failed to fetch task from Notion');
    }
}

/**
 * 创建新任务
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
    const status = input.status || DEFAULT_VALUES.STATUS;

    // 验证状态值
    if (!isValidStatus(status)) {
        throw new Error(`Invalid status value: ${status}. Must be one of: 待跟进, 计划中, 丢弃, 搁置, 已解决`);
    }

    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                [NOTION_PROPERTIES.TITLE]: {
                    title: [
                        {
                            text: {
                                content: input.title,
                            },
                        },
                    ],
                },
                [NOTION_PROPERTIES.STATUS]: {
                    status: {
                        name: status,
                    },
                },
            },
        });

        if (!('properties' in response)) {
            throw new Error('Invalid page response');
        }

        return pageToTask(response as PageObjectResponse);
    } catch (error) {
        console.error('Error creating task in Notion:', error);
        throw new Error('Failed to create task in Notion');
    }
}

/**
 * 更新任务
 */
export async function updateTask(pageId: string, input: UpdateTaskInput): Promise<Task> {
    const properties: any = {};

    // 更新标题
    if (input.title !== undefined) {
        properties[NOTION_PROPERTIES.TITLE] = {
            title: [
                {
                    text: {
                        content: input.title,
                    },
                },
            ],
        };
    }

    // 更新状态
    if (input.status !== undefined) {
        if (!isValidStatus(input.status)) {
            throw new Error(`Invalid status value: ${input.status}. Must be one of: 待跟进, 计划中, 丢弃, 搁置, 已解决`);
        }

        properties[NOTION_PROPERTIES.STATUS] = {
            status: {
                name: input.status,
            },
        };
    }

    try {
        const response = await notion.pages.update({
            page_id: pageId,
            properties,
        });

        if (!('properties' in response)) {
            throw new Error('Invalid page response');
        }

        return pageToTask(response as PageObjectResponse);
    } catch (error) {
        console.error(`Error updating task ${pageId}:`, error);
        throw new Error('Failed to update task in Notion');
    }
}
