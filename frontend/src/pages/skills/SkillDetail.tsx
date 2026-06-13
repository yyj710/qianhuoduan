import { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Typography, Button, Space, Row, Col, Spin, message as antMsg, Divider } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { skillService } from '../../services/skillService';
import { orderService } from '../../services/orderService';
import { messageService } from '../../services/messageService';
import { bookmarkService } from '../../services/bookmarkService';
import { getCategoryLabel, getCategoryColor } from '../../constants/categories';

const { Title, Paragraph, Text } = Typography;

export default function SkillDetail() {
  const { id } = useParams();
  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    skillService.getById(Number(id))
      .then(res => setSkill(res.data))
      .finally(() => setLoading(false));

    if (user) {
      bookmarkService.check('skill', Number(id)).then(res => setIsBookmarked(res.data.bookmarked)).catch(() => {});
    }
  }, [id, user?.id]);

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

  const handleBookmark = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      if (isBookmarked) {
        await bookmarkService.remove('skill', skill.id);
        setIsBookmarked(false);
        antMsg.success('已取消收藏');
      } else {
        await bookmarkService.add('skill', skill.id);
        setIsBookmarked(true);
        antMsg.success('已收藏');
      }
    } catch { /* handled */ }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!skill) return <div>技能不存在</div>;

  const isOwner = user?.id === skill.userId;

  return (
    <div>
      <Card>
        <Row gutter={[24, 16]}>
          <Col xs={24} md={17}>
            {skill.category && <Tag color={getCategoryColor(skill.category)} style={{ marginBottom: 8 }}>{getCategoryLabel(skill.category)}</Tag>}
            <Title level={3}>{skill.title}</Title>
            <Space style={{ marginBottom: 16 }}>
              {skill.tags?.map((t: string) => <Tag key={t} color="blue">{t}</Tag>)}
              <Tag color="purple">{skill.campus}</Tag>
              <Tag>{skill.deliveryTime}</Tag>
            </Space>
            <Paragraph style={{ fontSize: 16, whiteSpace: 'pre-wrap' }}>{skill.description}</Paragraph>
          </Col>
          <Col xs={24} md={7}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, color: '#f5222d', fontWeight: 'bold', marginBottom: 8 }}>¥{skill.price}</div>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ cursor: 'pointer' }} onClick={() => navigate(`/users/${skill.userId}`)}>
                  发布者：{skill.user?.username}
                  {skill.user?.verified && <Tag color="blue" style={{ marginLeft: 4, fontSize: 10 }}>✓</Tag>}
                </Text>
                <br />
                <Text type="secondary">信用分：⭐{skill.user?.creditScore?.toFixed(1)}</Text>
              </div>
              {!isOwner && (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button type="primary" block onClick={handleOrder}>立即下单</Button>
                  <Button block onClick={handleChat}>联系TA</Button>
                  <Button block icon={isBookmarked ? <HeartFilled /> : <HeartOutlined />} onClick={handleBookmark}
                    style={{ color: isBookmarked ? '#ff4d4f' : undefined }}>
                    {isBookmarked ? '已收藏' : '收藏'}
                  </Button>
                </Space>
              )}
              {isOwner && (
                <Space>
                  <Button onClick={() => navigate(`/skills/${skill.id}/edit`)}>编辑</Button>
                  <Button danger onClick={async () => { await skillService.delete(skill.id); antMsg.success('已下架'); navigate('/skills'); }}>下架</Button>
                </Space>
              )}
            </Card>
          </Col>
        </Row>

        <Divider />
        <Descriptions title="发布者信息" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="用户名">
            <span style={{ cursor: 'pointer', color: '#1677ff' }} onClick={() => navigate(`/users/${skill.userId}`)}>{skill.user?.username}</span>
          </Descriptions.Item>
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
