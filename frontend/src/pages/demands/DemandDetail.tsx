import { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Typography, Spin, List, Button, Space, Divider, message as antMsg } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { demandService } from '../../services/demandService';
import { orderService } from '../../services/orderService';

const { Title, Paragraph, Text } = Typography;

export default function DemandDetail() {
  const { id } = useParams();
  const [demand, setDemand] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      demandService.getById(Number(id)),
      demandService.getMatches(Number(id)),
    ]).then(([dRes, mRes]) => {
      setDemand(dRes.data);
      setMatches(mRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async (match: any) => {
    if (!user) { navigate('/login'); return; }
    try {
      await orderService.create({ sellerId: match.userId, skillId: match.skillId, amount: match.price });
      antMsg.success('订单创建成功');
      navigate('/orders');
    } catch { /* handled */ }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!demand) return <div>需求不存在</div>;

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Title level={3}>{demand.title}</Title>
        <Space style={{ marginBottom: 16 }}>
          {demand.tags?.map((t: string) => <Tag key={t} color="green">{t}</Tag>)}
          <Tag color="purple">{demand.campus}</Tag>
          <Tag>截止：{demand.deadline}</Tag>
        </Space>
        <Paragraph style={{ fontSize: 16, whiteSpace: 'pre-wrap' }}>{demand.description}</Paragraph>
        <Descriptions>
          <Descriptions.Item label="预算"><Text strong style={{ color: '#52c41a', fontSize: 18 }}>¥{demand.budget}</Text></Descriptions.Item>
          <Descriptions.Item label="发布者">{demand.user?.username}</Descriptions.Item>
          <Descriptions.Item label="信用评分">⭐{demand.user?.creditScore?.toFixed(1)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Divider>智能匹配结果</Divider>
      {matches.length === 0 ? (
        <Card>暂无匹配的技能，请稍后查看</Card>
      ) : (
        <List
          dataSource={matches}
          renderItem={(match: any, index: number) => (
            <Card style={{ marginBottom: 12 }} key={match.skillId}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Space>
                    <Tag color="orange">推荐 #{index + 1}</Tag>
                    <Text strong style={{ fontSize: 16 }}>{match.title}</Text>
                  </Space>
                  <div style={{ margin: '8px 0' }}>
                    {match.tags?.map((t: string) => <Tag key={t} color="blue">{t}</Tag>)}
                    <Tag>{match.campus}</Tag>
                  </div>
                  <Space>
                    <Text>匹配度：<Text strong style={{ color: '#1677ff' }}>{match.totalScore.toFixed(1)}%</Text></Text>
                    <Text>标签匹配：{match.tagScore.toFixed(1)}%</Text>
                    <Text>信用分：⭐{match.creditScore.toFixed(1)}</Text>
                    <Text>价格：¥{match.price}</Text>
                  </Space>
                </div>
                <Button type="primary" onClick={() => handleOrder(match)} disabled={!user || user.id === match.userId}>下单</Button>
              </div>
            </Card>
          )}
        />
      )}
    </div>
  );
}
