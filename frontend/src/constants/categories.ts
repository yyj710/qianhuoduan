export const CATEGORIES = [
  { value: 'academic_tutor', label: '学业辅导', icon: 'BookOutlined', color: '#1677ff' },
  { value: 'kaoyan', label: '考研考公', icon: 'ReadOutlined', color: '#722ed1' },
  { value: 'career', label: '求职就业', icon: 'SolutionOutlined', color: '#eb2f96' },
  { value: 'thesis', label: '论文写作', icon: 'FileTextOutlined', color: '#fa8c16' },
  { value: 'tech', label: '技术开发', icon: 'CodeOutlined', color: '#52c41a' },
  { value: 'lang', label: '语言翻译', icon: 'GlobalOutlined', color: '#13c2c2' },
  { value: 'secondhand', label: '二手转让', icon: 'SwapOutlined', color: '#faad14' },
  { value: 'life', label: '生活服务', icon: 'HomeOutlined', color: '#f5222d' },
  { value: 'other', label: '其他', icon: 'AppstoreOutlined', color: '#8c8c8c' },
];

export const getCategoryLabel = (value?: string | null) => {
  if (!value) return '';
  return CATEGORIES.find(c => c.value === value)?.label || value;
};

export const getCategoryColor = (value?: string | null) => {
  if (!value) return '#8c8c8c';
  return CATEGORIES.find(c => c.value === value)?.color || '#8c8c8c';
};

export const IDENTITY_OPTIONS = [
  { value: '大一', label: '大一' },
  { value: '大二', label: '大二' },
  { value: '大三', label: '大三' },
  { value: '大四', label: '大四' },
  { value: '研究生', label: '研究生' },
  { value: '校友', label: '校友' },
];
