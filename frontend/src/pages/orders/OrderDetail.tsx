import { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Typography, Button, Space, Spin, Steps, Modal, Input, Rate, message as antMsg } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { orderService } from '../../services/orderService';
import { messageService } from '../../services/messageService';

const { Title, Text } = Typography;

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'orange', text: '待确认' },
  1: { color: 'blue', text: '进行中' },
  2: { color: 'green', text: '已完成' },
  3: { color: 'default', text: '已取消' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evalVisible, setEvalVisible] = useState(false);
  const [evalScore, setEvalScore] = useState(5);
  const [evalContent, setEvalContent] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const fetchOrder = () => {
    orderService.getById(Number(id))
      .then(res => setOrder(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleAction = async (action: string) => {
    try {
      switch (action) {
        case 'confirm': await orderService.confirm(Number(id)); antMsg.success('订单已确认'); break;
        case 'cancel': await orderService.cancel(Number(id)); antMsg.success('订单已取消'); break;
      }
      fetchOrder();
    } catch { /* handled */ }
  };

  const handleCompleteWithEval = async () => {
    try {
      await orderService.complete(Number(id), { score: evalScore, content: evalContent });
      antMsg.success('订单已完成，评价已提交');
      setEvalVisible(false);
      fetchOrder();
    } catch { /* handled */ }
  };

  const handleEvaluate = async () => {
    try {
      await orderService.evaluate(Number(id), { score: evalScore, content: evalContent });
      antMsg.success('评价成功');
      setEvalVisible(false);
      fetchOrder();
    } catch { /* handled */ }
  };

  const handleContact = async (peerId: number, peerName: string) => {
    try {
      await messageService.send({
        receiverId: peerId,
        content: `你好，关于订单${order.orderNo}的"${order.skill?.title}"，我想沟通一下。`,
        orderId: Number(id),
        type: 'order',
      });
      antMsg.success('消息已发送');
      navigate(`/messages/${peerId}`);
    } catch { /* handled */ }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!order) return <div>订单不存在</div>;

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;
  const hasBuyerEval = order.comments?.some((c: any) => c.userId === order.buyerId);
  const hasSellerEval = order.comments?.some((c: any) => c.userId === order.sellerId);
  const canSellerEval = isSeller && !hasSellerEval && order.status === 2;
  const canBuyerCompleteAndEval = isBuyer && !hasBuyerEval && order.status === 1;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>订单详情</Title>
          <Tag color={statusMap[order.status]?.color}>{statusMap[order.status]?.text}</Tag>
        </div>

        {order.status !== 3 ? (
          <Steps current={order.status} size="small" style={{ marginBottom: 24 }}
            items={[
              { title: '待确认' }, { title: '进行中' }, { title: '已完成' },
            ]}
          />
        ) : (
          <div style={{ marginBottom: 24, textAlign: 'center', color: '#999' }}>订单已取消</div>
        )}

        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="订单编号">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="金额"><Text strong style={{ color: '#f5222d', fontSize: 16 }}>¥{order.amount}</Text></Descriptions.Item>
          <Descriptions.Item label="技能">{order.skill?.title}</Descriptions.Item>
          <Descriptions.Item label="需求方">
            <Space>{order.buyer?.username}
              {order.status === 2 && isSeller && <Button size="small" type="link" icon={<MessageOutlined />} onClick={() => handleContact(order.buyerId, order.buyer?.username)}>联系</Button>}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="技能方">
            <Space>{order.seller?.username}
              {order.status >= 1 && isBuyer && <Button size="small" type="link" icon={<MessageOutlined />} onClick={() => handleContact(order.sellerId, order.seller?.username)}>联系</Button>}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{new Date(order.createTime).toLocaleString()}</Descriptions.Item>
          {order.confirmTime && <Descriptions.Item label="确认时间">{new Date(order.confirmTime).toLocaleString()}</Descriptions.Item>}
          {order.completeTime && <Descriptions.Item label="完成时间">{new Date(order.completeTime).toLocaleString()}</Descriptions.Item>}
        </Descriptions>

        {/* Action buttons */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Space wrap>
            {order.status === 0 && (isBuyer || isSeller) && (
              <>
                <Button type="primary" onClick={() => handleAction('confirm')}>确认订单</Button>
                <Button danger onClick={() => handleAction('cancel')}>取消订单</Button>
              </>
            )}
            {canBuyerCompleteAndEval && (
              <Button type="primary" onClick={() => { setEvalScore(5); setEvalContent(''); setEvalVisible(true); }}>
                确认完成并评价
              </Button>
            )}
            {canSellerEval && (
              <Button type="primary" ghost onClick={() => { setEvalScore(5); setEvalContent(''); setEvalVisible(true); }}>
                评价买家
              </Button>
            )}
          </Space>
        </div>

        {/* Evaluations */}
        {order.comments?.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <Title level={5}>评价记录</Title>
            {order.comments.map((c: any) => (
              <Card key={c.id} size="small" style={{ marginBottom: 8 }}>
                <div><Text strong>{c.user?.username}</Text> → <Text strong>{c.target?.username}</Text></div>
                <Rate disabled value={c.score} />
                {c.content && <div><Text type="secondary">{c.content}</Text></div>}
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Evaluation Modal */}
      <Modal
        title={canBuyerCompleteAndEval ? '确认完成并评价' : '评价'}
        open={evalVisible}
        onOk={canBuyerCompleteAndEval ? handleCompleteWithEval : handleEvaluate}
        onCancel={() => setEvalVisible(false)}
        okText={canBuyerCompleteAndEval ? '确认完成' : '提交评价'}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>评分：</Text>
          <Rate value={evalScore} onChange={setEvalScore} />
        </div>
        <Input.TextArea
          placeholder="写下你的评价（选填）"
          value={evalContent}
          onChange={e => setEvalContent(e.target.value)}
          maxLength={500}
          rows={3}
        />
      </Modal>
    </div>
  );
}
