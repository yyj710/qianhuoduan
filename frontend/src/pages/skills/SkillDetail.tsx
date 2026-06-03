import { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Typography, Button, Space, Spin, message as antMsg, Divider } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { skillService } from '../../services/skillService';
import { orderService } from '../../services/orderService';
import { messageService } from '../../services/messageService';

const { Title, Paragraph, Text } = Typography;

export default function SkillDetail() {
  const { id } = useParams();
  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    skillService.getById(Number(id))
      .then(res => setSkill(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await orderService.create({ sellerId: skill.userId, skillId: skill.id, amount: skill.price });
      antMsg.success('订单创建成功，请前往订单页确认');
      navigate('/orders');
    } catch { /* handled */ }
  };

  const handleChat = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await messageService.send({ receiverId: skill.userId, content: `你好，我对你的技能"${skill.title}"很感兴趣！` });
      antMsg.success('消息已发送');
      navigate(`/messages/${skill.userId}`);
    } catch { /* handled */ }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!skill) return <div>技能不存在</div>;

  const isOwner = user?.id === skill.userId;

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Title level={3}>{skill.title}</Title>
            <Space style={{ marginBottom: 16 }}>
              {skill.tags?.map((t: string) => <Tag key={t} color="blue">{t}</Tag>)}
              <Tag color="purple">{skill.campus}</Tag>
              <Tag>{skill.deliveryTime}</Tag>
            </Space>
            <Paragraph style={{ fontSize: 16, whiteSpace: 'pre-wrap' }}>{skill.description}</Paragraph>
          </div>
          <Card size="small" style={{ width: 240, textAlign: 'center' }}>
            <div style={{ fontSize: 28, color: '#f5222d', fontWeight: 'bold', marginBottom: 8 }}>¥{skill.price}</div>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">发布者：{skill.user?.username}</Text>
              <br />
              <Text type="secondary">信用分：⭐{skill.user?.creditScore?.toFixed(1)}</Text>
            </div>
            {!isOwner && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" block onClick={handleOrder}>立即下单</Button>
                <Button block onClick={handleChat}>联系TA</Button>
              </Space>
            )}
            {isOwner && (
              <Space>
                <Button onClick={() => navigate(`/skills/${skill.id}/edit`)}>编辑</Button>
                <Button danger onClick={async () => { await skillService.delete(skill.id); antMsg.success('已下架'); navigate('/skills'); }}>下架</Button>
              </Space>
            )}
          </Card>
        </div>

        <Divider />
        <Descriptions title="发布者信息">
          <Descriptions.Item label="用户名">{skill.user?.username}</Descriptions.Item>
          <Descriptions.Item label="校区">{skill.user?.campus || '未设置'}</Descriptions.Item>
          <Descriptions.Item label="信用评分">⭐{skill.user?.creditScore?.toFixed(1)}</Descriptions.Item>
          <Descriptions.Item label="在线状态">{skill.user?.onlineStatus === 1 ? '🟢在线' : '⚫离线'}</Descriptions.Item>
          <Descriptions.Item label="成交量">{skill.dealCount}单</Descriptions.Item>
          <Descriptions.Item label="浏览量">{skill.viewCount}次</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
