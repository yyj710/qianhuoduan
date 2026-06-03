import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Typography, Input, Select, Button, Space, Empty, Pagination, Rate } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { skillService } from '../../services/skillService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const { Title, Text } = Typography;
const campusFilters = ['', '粤海校区', '丽湖校区', '沧海校区', '不限'];

export default function SkillList() {
  const [skills, setSkills] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [campus, setCampus] = useState('');
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  const fetchSkills = () => {
    setLoading(true);
    skillService.list({ page, pageSize: 12, keyword: keyword || undefined, campus: campus || undefined })
      .then(res => { setSkills(res.data.list); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSkills(); }, [page]);

  const onSearch = () => { setPage(1); fetchSkills(); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>技能市场</Title>
        {isLoggedIn && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/skills/create')}>发布技能</Button>
        )}
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="搜索技能" prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={onSearch} style={{ width: 200 }} />
        <Select placeholder="校区" style={{ width: 120 }} value={campus} onChange={v => { setCampus(v); setPage(1); }} allowClear options={campusFilters.filter(Boolean).map(c => ({ label: c, value: c }))} />
        <Button type="primary" onClick={onSearch}>搜索</Button>
      </Space>
      {skills.length === 0 && !loading ? <Empty description="暂无技能" /> : (
        <Row gutter={[16, 16]}>
          {skills.map((s: any) => (
            <Col key={s.id} xs={24} sm={12} md={8} lg={6}>
              <Card hoverable className="card-hover" onClick={() => navigate(`/skills/${s.id}`)}>
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
                  <Text type="secondary">{s.user?.username}</Text>
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
