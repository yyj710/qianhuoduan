import { useEffect, useState } from 'react';
import { List, Tag, Button, Empty, Space, Typography, Tabs, message } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, ToolOutlined, FileSearchOutlined, StarOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';

const { Text } = Typography;

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  skill_new: { icon: ToolOutlined, color: 'blue', label: '新技能' },
  demand_match: { icon: FileSearchOutlined, color: 'orange', label: '需求匹配' },
  bookmark: { icon: StarOutlined, color: 'gold', label: '收藏' },
  follow: { icon: UserAddOutlined, color: 'green', label: '关注' },
  system: { icon: BellOutlined, color: 'default', label: '系统' },
};

export default function NotificationPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<string>('unread');

  const fetchList = async (readStatus?: number) => {
    setLoading(true);
    try {
      const res = await notificationService.list(readStatus);
      setList(res.data.list || []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(tab === 'unread' ? 0 : undefined);
  }, [tab]);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markRead([id]);
      setList(prev => prev.map(n => n.id === id ? { ...n, readStatus: 1 } : n));
    } catch {
      message.error('标记失败');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setList(prev => prev.map(n => ({ ...n, readStatus: 1 })));
      message.success('已全部标记为已读');
    } catch {
      message.error('操作失败');
    }
  };

  const handleClick = (item: any) => {
    if (item.readStatus === 0) handleMarkRead(item.id);
    if (item.link) navigate(item.link);
  };

  const getIcon = (type: string) => {
    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.system;
    const Icon = cfg.icon;
    return <Icon style={{ fontSize: 20, color: cfg.color === 'default' ? '#999' : cfg.color }} />;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text strong style={{ fontSize: 18 }}>通知中心</Text>
        <Button size="small" icon={<CheckOutlined />} onClick={handleMarkAllRead}>全部已读</Button>
      </div>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: 'unread', label: '未读' },
          { key: 'all', label: '全部' },
        ]}
      />

      <List
        loading={loading}
        dataSource={list}
        locale={{ emptyText: <Empty description="暂无通知" /> }}
        renderItem={(item: any) => (
          <List.Item
            style={{
              cursor: 'pointer',
              padding: '12px 8px',
              background: item.readStatus === 1 ? 'transparent' : '#e6f4ff',
              borderRadius: 8,
              marginBottom: 4,
            }}
            onClick={() => handleClick(item)}
          >
            <List.Item.Meta
              avatar={getIcon(item.type)}
              title={
                <Space size={4}>
                  <Tag color={TYPE_CONFIG[item.type]?.color || 'default'} style={{ fontSize: 11 }}>
                    {TYPE_CONFIG[item.type]?.label || '通知'}
                  </Tag>
                  <Text style={{ fontSize: 13 }}>{item.title}</Text>
                </Space>
              }
              description={
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.content}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN') : ''}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}
