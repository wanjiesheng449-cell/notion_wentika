
export interface Task {
  id: string;
  title: string;
  status: '计划中' | '已解决' | '搁置' | '待跟进' | '丢弃';
  updatedAt: string;
  type?: string;
  color?: string;
  icon?: string;
}
