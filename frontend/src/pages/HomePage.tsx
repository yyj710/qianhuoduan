import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, List, Tag, Button, Input, Segmented, Timeline, Badge, Space } from 'antd';
import {
  ToolOutlined, FileSearchOutlined, UserOutlined, SearchOutlined, EnvironmentOutlined,
  BookOutlined, ReadOutlined, SolutionOutlined, FileTextOutlined,
  CodeOutlined, GlobalOutlined, SwapOutlined, HomeOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { skillService } from '../services/skillService';
import { demandService } from '../services/demandService';
import { announcementService } from '../services/announcementService';
import { CATEGORIES } from '../constants/categories';

const { Title, Text } = Typography;
const ICON_MAP: Record<string, any> = {
  BookOutlined, ReadOutlined, SolutionOutlined, FileTextOutlined,
  CodeOutlined, GlobalOutlined, SwapOutlined, HomeOutlined, AppstoreOutlined,
  ToolOutlined, FileSearchOutlined,
};


const CATEGORY_LABELS: Record<string, string> = {
  scholarship: '奖学金', lecture: '讲座', exam: '考试', competition: '比赛',
  activity: '活动', academic: '学术', recruitment: '就业', other: '其他',
};

const CATEGORY_COLORS: Record<string, string> = {
  scholarship: 'gold', lecture: 'purple', exam: 'red', competition: 'orange',
  activity: 'green', academic: 'blue', recruitment: 'cyan', other: 'default',
};

function formatDate(d: string | null) {
  if (!d) return '';
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function daysLeft(d: string | null) {
  if (!d) return Infinity;
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function HomePage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [stats, setStats] = useState({ skills: 0, demands: 0, users: 0 });
  const [searchType, setSearchType] = useState<string>('技能');
  const navigate = useNavigate();

  useEffect(() => {
    skillService.list({ pageSize: 6, sort: 'hot' }).then(res => {
      setSkills(res.data.list);
      setStats(prev => ({ ...prev, skills: res.data.total }));
    }).catch(() => {});
    demandService.list({ pageSize: 1 }).then(res => {
      setStats(prev => ({ ...prev, demands: res.data.total }));
    }).catch(() => {});
    announcementService.upcoming().then(res => {
      setEvents(res.data.events || []);
      setDeadlines(res.data.deadlines || []);
    }).catch(() => {});
  }, []);

  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    const path = searchType === '技能' ? '/skills' : '/demands';
    navigate(`${path}?keyword=${encodeURIComponent(value.trim())}`);
  };

  return (
    <div>
      {/* Hero Search */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>零费skill</Title>
        <Text type="secondary" style={{ fontSize: 14 }}>深大技能互助与校园资讯平台 — 让每项技能都有用武之地</Text>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto 24px' }}>
        <Input.Search
          size="large"
          placeholder={searchType === '技能' ? '搜索你需要的技能...' : '搜索校园需求...'}
          enterButton={<span><SearchOutlined /> 搜索</span>}
          onSearch={handleSearch}
          style={{ borderRadius: 8 }}
        />
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <Segmented
            size="small"
            value={searchType}
            onChange={(v) => setSearchType(v as string)}
            options={['技能', '需求']}
          />
        </div>
      </div>


      {/* Category Quick Entry Grid */}
      <Card
        size="small"
        style={{ marginBottom: 20, borderRadius: 12 }}
        bodyStyle={{ padding: '12px 8px' }}
      >
        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10, paddingLeft: 8 }}>
          🗂️ 分类导航
        </Text>
        <Row gutter={[8, 8]}>
          {CATEGORIES.map(cat => {
            const Icon = ICON_MAP[cat.icon] || AppstoreOutlined;
            return (
              <Col xs={8} sm={8} md={8} key={cat.value}>
                <div
                  onClick={() => navigate(`/skills?category=${cat.value}`)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 6, cursor: 'pointer', padding: '10px 4px', borderRadius: 8,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: cat.color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ fontSize: 22, color: cat.color }} />
                  </div>
                  <Text style={{ fontSize: 11, lineHeight: 1 }}>{cat.label}</Text>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>
      {/* Stats */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={8}>
          <Card size="small"><Statistic title="技能总数" value={stats.skills} prefix={<ToolOutlined />} /></Card>
        </Col>
        <Col xs={8}>
          <Card size="small"><Statistic title="需求总数" value={stats.demands} prefix={<FileSearchOutlined />} /></Card>
        </Col>
        <Col xs={8}>
          <Card size="small"><Statistic title="注册用户" value={stats.users} prefix={<UserOutlined />} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Hot Skills */}
        <Col xs={24} lg={14}>
          <Card
            title="🔥 热门技能"
            extra={<Button type="link" size="small" onClick={() => navigate('/skills')}>查看更多</Button>}
            style={{ marginBottom: 16 }}
          >
            <List
              dataSource={skills}
              renderItem={(item: any) => (
                <List.Item
                  extra={<Text strong style={{ color: '#f5222d', fontSize: 14 }}>¥{item.price}</Text>}
                  style={{ cursor: 'pointer', padding: '8px 0' }}
                  onClick={() => navigate(`/skills/${item.id}`)}
                >
                  <List.Item.Meta
                    title={<Text style={{ fontSize: 14 }}>{item.title}</Text>}
                    description={
                      <Space size={4} wrap>
                        {item.category && (
                          <Tag color="blue" style={{ fontSize: 11 }}>{item.categoryLabel || item.category}</Tag>
                        )}
                        {item.tags?.slice(0, 3).map((t: string) => <Tag key={t} color="blue" style={{ fontSize: 11 }}>{t}</Tag>)}
                        <Tag style={{ fontSize: 11 }}>{item.campus}</Tag>
                        {item.dealCount > 0 && <Text type="secondary" style={{ fontSize: 11 }}>{item.dealCount}笔成交</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Events Timeline */}
        <Col xs={24} lg={10}>
          <Card
            title="📅 近期校园活动"
            bodyStyle={{ padding: '12px 16px', maxHeight: 360, overflow: 'auto' }}
            style={{ marginBottom: 16 }}
          >
            {events.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 13 }}>暂无近期活动</Text>
            ) : (
              <Timeline
                items={events.slice(0, 8).map((item: any) => ({
                  color: CATEGORY_COLORS[item.category] || 'blue',
                  children: (
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => window.open(item.sourceUrl, '_blank')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        {item.category && (
                          <Tag color={CATEGORY_COLORS[item.category]} style={{ fontSize: 10, lineHeight: '16px', margin: 0 }}>
                            {CATEGORY_LABELS[item.category] || item.category}
                          </Tag>
                        )}
                        <Text style={{ fontSize: 12, color: '#1677ff' }}>{formatDate(item.eventDate)}</Text>
                      </div>
                      <Text strong style={{ fontSize: 13 }}>{item.title}</Text>
                      <div>
                        {item.eventLocation && (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            <EnvironmentOutlined /> {item.eventLocation}
                          </Text>
                        )}
                        {item.sourceDept && (
                          <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                            {item.sourceDept.replace(/color=#808080>/g, '')}
                          </Text>
                        )}
                      </div>
                    </div>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Deadlines */}
      {deadlines.length > 0 && (
        <Card
          title="⏰ 即将截止"
          extra={<Button type="link" size="small" onClick={() => navigate('/messages')}>更多资讯</Button>}
          style={{ marginBottom: 16 }}
        >
          <List
            dataSource={deadlines.slice(0, 6)}
            renderItem={(item: any) => {
              const left = daysLeft(item.deadline);
              return (
                <List.Item
                  style={{ cursor: 'pointer', padding: '8px 0' }}
                  onClick={() => window.open(item.sourceUrl, '_blank')}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        count={left <= 1 ? '今天截止' : left <= 3 ? `${left}天` : ''}
                        style={{ backgroundColor: left <= 1 ? '#ff4d4f' : '#faad14', fontSize: 10 }}
                      />
                    }
                    title={
                      <Space size={4}>
                        {item.category && (
                          <Tag color={CATEGORY_COLORS[item.category]} style={{ fontSize: 10, lineHeight: '16px' }}>
                            {CATEGORY_LABELS[item.category] || item.category}
                          </Tag>
                        )}
                        <Text strong style={{ fontSize: 13 }}>{item.title}</Text>
                      </Space>
                    }
                    description={
                      <Space size={8}>
                        <Text type="secondary" style={{ fontSize: 11 }}>截止: {formatDate(item.deadline)}</Text>
                        {item.sourceDept && (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {item.sourceDept.replace(/color=#808080>/g, '')}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      )}
    </div>
  );
}
