import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, List, Input, Button, Typography, Space, Badge, Avatar, Divider, Empty, message as antMsg } from 'antd';
import { SendOutlined, UserOutlined, LeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { messageService } from '../../services/messageService';
import { setUnreadCount } from '../../store/messageSlice';

const { Title, Text } = Typography;

export default function MessageList() {
  const { peerId } = useParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activePeer, setActivePeer] = useState<number | null>(peerId ? Number(peerId) : null);
  const [activePeerName, setActivePeerName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await messageService.getConversations();
      setConversations(res.data);
    } catch { /* ignore */ }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!activePeer) return;
    try {
      const res = await messageService.list({ peerId: activePeer, pageSize: 50 });
      setMessages(res.data.list.reverse());

      // Mark as read
      const unreadIds = res.data.list.filter((m: any) => m.receiverId === user?.id && m.readStatus === 0).map((m: any) => m.id);
      if (unreadIds.length > 0) {
        await messageService.markRead(unreadIds);
        const countRes = await messageService.getUnreadCount();
        dispatch(setUnreadCount(countRes.data.count));
      }
    } catch { /* ignore */ }
  }, [activePeer, user?.id, dispatch]);

  useEffect(() => {
    fetchConversations();
    const cInterval = setInterval(fetchConversations, 5000);
    return () => clearInterval(cInterval);
  }, [fetchConversations]);

  useEffect(() => {
    fetchMessages();
    const mInterval = setInterval(fetchMessages, 3000);
    return () => clearInterval(mInterval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !activePeer) return;
    try {
      await messageService.send({ receiverId: activePeer, content: inputValue.trim() });
      setInputValue('');
      fetchMessages();
      fetchConversations();
    } catch { /* handled */ }
  };

  const selectPeer = (peerId: number, name: string) => {
    setActivePeer(peerId);
    setActivePeerName(name);
    navigate(`/messages/${peerId}`, { replace: true });
  };

  const goBack = () => {
    setActivePeer(null);
    setActivePeerName('');
    navigate('/messages', { replace: true });
  };

  return (
    <div style={{ display: 'flex', height: isMobile ? 'calc(100dvh - 120px)' : 'calc(100vh - 180px)' }}>
      {/* Conversation list — hidden on mobile when chat is active */}
      {(!isMobile || !activePeer) && (
        <Card title="会话列表" style={{ width: isMobile ? '100%' : 280, marginRight: isMobile ? 0 : 16, overflow: 'auto' }}>
          {conversations.length === 0 ? <Empty description="暂无消息" /> : (
            <List
              dataSource={conversations}
              renderItem={(conv: any) => (
                <List.Item
                  style={{ cursor: 'pointer', background: activePeer === conv.peerId ? '#f0f0f0' : undefined, padding: 8 }}
                  onClick={() => selectPeer(conv.peerId, conv.peer?.username)}
                >
                  <List.Item.Meta
                    avatar={<Badge count={conv.unreadCount} size="small"><Avatar icon={<UserOutlined />} src={conv.peer?.avatar} /></Badge>}
                    title={conv.peer?.username}
                    description={<Text ellipsis style={{ maxWidth: isMobile ? 240 : 160 }}>{conv.lastMessage}</Text>}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      )}

      {/* Chat area — hidden on mobile when no peer selected */}
      {(!isMobile || activePeer) && (
        <Card
          title={
            isMobile && activePeer ? (
              <Space>
                <Button type="text" icon={<LeftOutlined />} onClick={goBack} style={{ padding: 0 }} />
                <span>{activePeerName}</span>
              </Space>
            ) : (activePeerName ? `与 ${activePeerName} 的对话` : '选择一个会话')
          }
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}
        >
          {!activePeer ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty description={isMobile ? '选择一个会话开始聊天' : '选择左侧会话开始聊天'} />
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                {messages.length === 0 ? <Empty description="暂无消息，发送第一条消息吧" /> : (
                  messages.map((msg: any) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                        <div style={{ maxWidth: '60%', background: isMine ? '#1677ff' : '#f0f0f0', color: isMine ? '#fff' : '#000', padding: '8px 12px', borderRadius: 12 }}>
                          <div>{msg.content}</div>
                          <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
                            {new Date(msg.createTime).toLocaleTimeString()}
                            {isMine && (msg.readStatus === 1 ? ' ✓已读' : ' ✓')}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <Divider style={{ margin: 0 }} />
              <div style={{ padding: 12, display: 'flex', gap: 8 }}>
                <Input.TextArea
                  value={inputValue} onChange={e => setInputValue(e.target.value)}
                  placeholder="输入消息..." rows={2} onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>发送</Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
