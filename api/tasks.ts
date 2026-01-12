import { Task } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new ApiError(response.status, error.error || `HTTP ${response.status}`);
    }
    return response.json();
}

/**
 * 获取所有任务列表
 */
export async function fetchTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    return handleResponse<Task[]>(response);
}

/**
 * 获取单个任务详情
 */
export async function fetchTaskById(id: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    return handleResponse<Task>(response);
}

/**
 * 创建新任务
 */
export async function createTask(data: { title: string; status?: string }): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse<Task>(response);
}

/**
 * 更新任务
 */
export async function updateTask(id: string, data: { title?: string; status?: string }): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse<Task>(response);
}

export { ApiError };
