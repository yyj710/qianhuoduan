import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, List, Tag, Button, Space } from 'antd';
import { ToolOutlined, FileSearchOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { skillService } from '../services/skillService';
import { demandService } from '../services/demandService';

const { Title, Text } = Typography;

export default function HomePage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [stats, setStats] = useState({ skills: 0, demands: 0, users: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    skillService.list({ pageSize: 5 }).then(res => {
      setSkills(res.data.list);
      setStats(prev => ({ ...prev, skills: res.data.total }));
    }).catch(() => {});
    demandService.list({ pageSize: 5 }).then(res => {
      setDemands(res.data.list);
      setStats(prev => ({ ...prev, demands: res.data.total }));
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>欢迎来到深技联</Title>
        <Text type="secondary">深圳大学0佣金技能互助与竞赛资源平台 — 让市场在资源配置中起决定作用</Text>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card><Statistic title="技能总数" value={stats.skills} prefix={<ToolOutlined />} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="需求总数" value={stats.demands} prefix={<FileSearchOutlined />} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="注册用户" value={stats.users} prefix={<UserOutlined />} /></Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card
            title="🔥 最新技能"
            extra={<Button type="link" onClick={() => navigate('/skills')}>查看更多</Button>}
          >
            <List
              dataSource={skills}
              renderItem={(item: any) => (
                <List.Item
                  extra={<Text strong style={{ color: '#f5222d' }}>¥{item.price}</Text>}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/skills/${item.id}`)}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <Space size={4}>
                        {item.tags?.slice(0, 3).map((t: string) => <Tag key={t} color="blue">{t}</Tag>)}
                        <Tag>{item.campus}</Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="📋 最新需求"
            extra={<Button type="link" onClick={() => navigate('/demands')}>查看更多</Button>}
          >
            <List
              dataSource={demands}
              renderItem={(item: any) => (
                <List.Item
                  extra={<Text strong style={{ color: '#52c41a' }}>¥{item.budget}</Text>}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/demands/${item.id}`)}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <Space size={4}>
                        {item.tags?.slice(0, 3).map((t: string) => <Tag key={t} color="green">{t}</Tag>)}
                        <Tag>{item.campus}</Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
