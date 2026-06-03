import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Typography, Input, Select, Button, Space, Empty, Pagination } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { demandService } from '../../services/demandService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const { Title, Text } = Typography;

export default function DemandList() {
  const [demands, setDemands] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [campus, setCampus] = useState('');
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  const fetchList = () => {
    setLoading(true);
    demandService.list({ page, pageSize: 12, keyword: keyword || undefined, campus: campus || undefined })
      .then(res => { setDemands(res.data.list); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchList(); }, [page]);

  const statusMap: Record<number, { color: string; text: string }> = { 0: { color: 'default', text: '已关闭' }, 1: { color: 'green', text: '正常' }, 2: { color: 'blue', text: '已完成' } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>需求大厅</Title>
        {isLoggedIn && <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/demands/create')}>发布需求</Button>}
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="搜索需求" prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => { setPage(1); fetchList(); }} style={{ width: 200 }} />
        <Select placeholder="校区" style={{ width: 120 }} value={campus} onChange={v => { setCampus(v); setPage(1); }} allowClear options={['粤海校区', '丽湖校区', '沧海校区', '不限'].map(c => ({ label: c, value: c }))} />
        <Button type="primary" onClick={() => { setPage(1); fetchList(); }}>搜索</Button>
      </Space>
      {demands.length === 0 && !loading ? <Empty description="暂无需求" /> : (
        <Row gutter={[16, 16]}>
          {demands.map((d: any) => (
            <Col key={d.id} xs={24} sm={12} md={8} lg={6}>
              <Card hoverable className="card-hover" onClick={() => navigate(`/demands/${d.id}`)}>
                <div style={{ marginBottom: 4 }}>
                  <Tag color={statusMap[d.status]?.color}>{statusMap[d.status]?.text}</Tag>
                </div>
                <Text strong style={{ fontSize: 16 }}>{d.title}</Text>
                <div style={{ margin: '8px 0' }}>
                  {d.tags?.map((t: string) => <Tag key={t} color="green">{t}</Tag>)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, color: '#52c41a', fontWeight: 'bold' }}>¥{d.budget}</Text>
                  <Tag>{d.campus}</Tag>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">截止：{d.deadline}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>匹配：{d.matchCount}次</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      {total > 12 && <div style={{ textAlign: 'center', marginTop: 24 }}><Pagination current={page} total={total} pageSize={12} onChange={p => setPage(p)} /></div>}
    </div>
  );
}
