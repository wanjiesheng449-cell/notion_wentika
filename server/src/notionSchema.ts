/**
 * Notion Database Schema Mapping
 * 集中维护 Notion 字段映射配置
 */

// Notion 属性名称（必须与 Notion 数据库中的属性名完全一致）
export const NOTION_PROPERTIES = {
    TITLE: '标题',      // Title property
    STATUS: '状态',     // Status property
} as const;

// Notion Status 可选值（name 字段）
// 注意：待办/进行中/已完成 是分组标题，不参与写入
export const VALID_STATUS_VALUES = [
    '待跟进',
    '计划中',
    '丢弃',
    '搁置',
    '已解决',
] as const;

export type NotionStatus = typeof VALID_STATUS_VALUES[number];

// 验证状态值是否有效
export function isValidStatus(status: string): status is NotionStatus {
    return VALID_STATUS_VALUES.includes(status as NotionStatus);
}

// 默认值配置
export const DEFAULT_VALUES = {
    STATUS: '待跟进' as NotionStatus,
    TYPE: '任务',
    COLOR: '#3b82f6',
    ICON: 'check_circle',
} as const;
