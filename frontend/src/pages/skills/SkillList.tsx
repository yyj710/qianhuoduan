import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Typography, Input, Select, Button, Empty, Pagination, Rate } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { skillService } from '../../services/skillService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { CATEGORIES, getCategoryLabel, getCategoryColor } from '../../constants/categories';

const { Title, Text } = Typography;
const campusFilters = ['', '粤海校区', '丽湖校区', '沧海校区', '不限'];

export default function SkillList() {
  const [skills, setSkills] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [campus, setCampus] = useState('');
  const [category, setCategory] = useState('');
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  const fetchSkills = () => {
    setLoading(true);
    skillService.list({ page, pageSize: 12, keyword: keyword || undefined, campus: campus || undefined, category: category || undefined })
      .then(res => { setSkills(res.data.list); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSkills(); }, [page, category]);

  const onSearch = () => { setPage(1); fetchSkills(); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>技能市场</Title>
        {isLoggedIn && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/skills/create')}>发布技能</Button>
        )}
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        <Tag color={!category ? 'blue' : undefined} style={{ cursor: 'pointer', fontSize: 13, padding: '2px 10px' }} onClick={() => { setCategory(''); setPage(1); }}>全部</Tag>
        {CATEGORIES.map(c => (
          <Tag key={c.value} color={category === c.value ? 'blue' : undefined} style={{ cursor: 'pointer', fontSize: 13, padding: '2px 10px' }} onClick={() => { setCategory(c.value); setPage(1); }}>
            {c.label}
          </Tag>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input placeholder="搜索技能" prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={onSearch} style={{ flex: '1 1 200px', minWidth: 120 }} />
        <Select placeholder="校区" style={{ flex: '0 0 120px' }} value={campus} onChange={v => { setCampus(v); setPage(1); }} allowClear options={campusFilters.filter(Boolean).map(c => ({ label: c, value: c }))} />
        <Button type="primary" onClick={onSearch}>搜索</Button>
      </div>
      {skills.length === 0 && !loading ? <Empty description="暂无技能" /> : (
        <Row gutter={[16, 16]}>
          {skills.map((s: any) => (
            <Col key={s.id} xs={24} sm={12} md={8} lg={6}>
              <Card hoverable className="card-hover" onClick={() => navigate(`/skills/${s.id}`)}>
                {s.category && <Tag color={getCategoryColor(s.category)} style={{ marginBottom: 8 }}>{getCategoryLabel(s.category)}</Tag>}
                <div style={{ marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 16 }}>{s.title}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  {s.tags?.map((t: string) => <Tag key={t} color="blue">{t}</Tag>)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, color: '#f5222d', fontWeight: 'bold' }}>¥{s.price}</Text>
                  <Tag>{s.campus}</Tag>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); navigate(`/users/${s.userId}`); }}>{s.user?.username}</Text>
                  {s.user?.verified && <Tag color="blue" style={{ marginLeft: 4, fontSize: 10 }}>✓</Tag>}
                  <Text type="secondary" style={{ marginLeft: 8 }}>⭐{s.user?.creditScore?.toFixed(1)}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>📦{s.dealCount}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      {total > 12 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination current={page} total={total} pageSize={12} onChange={p => setPage(p)} />
        </div>
      )}
    </div>
  );
}
