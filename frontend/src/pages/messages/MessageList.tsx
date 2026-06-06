import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, List, Input, Button, Typography, Space, Badge, Avatar, Divider, Empty, Tabs, Tag, Skeleton } from 'antd';
import { SendOutlined, UserOutlined, LeftOutlined, BellOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { messageService } from '../../services/messageService';
import { announcementService } from '../../services/announcementService';
import { setUnreadCount } from '../../store/messageSlice';

const { Title, Text, Paragraph } = Typography;

const CATEGORY_LABELS: Record<string, string> = {
  scholarship: '奖学金',
  lecture: '讲座',
  exam: '考试',
  competition: '比赛',
  activity: '活动',
  academic: '学术',
  recruitment: '就业',
  other: '其他',
};

const CATEGORY_COLORS: Record<string, string> = {
  scholarship: 'gold',
  lecture: 'purple',
  exam: 'red',
  competition: 'orange',
  activity: 'green',
  academic: 'blue',
  recruitment: 'cyan',
  other: 'default',
};

function AnnouncementPanel() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 15;

  const fetchAnnouncements = useCallback(async (cat: string, p: number) => {
    setLoading(true);
    try {
      const res = await announcementService.list({
        category: cat === 'all' ? undefined : cat,
        page: p,
        pageSize: PAGE_SIZE,
      });
      if (p === 1) {
        setAnnouncements(res.data.list);
      } else {
        setAnnouncements(prev => [...prev, ...res.data.list]);
      }
      setTotal(res.data.total);
      if (res.data.categories) setCategories(res.data.categories);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(1);
    fetchAnnouncements(activeCategory, 1);
  }, [activeCategory, fetchAnnouncements]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAnnouncements(activeCategory, nextPage);
  };

  const formatDate = (d: string | null) => {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const categoryTabs = [
    { key: 'all', label: `全部(${total})` },
    ...Object.entries(CATEGORY_LABELS)
      .filter(([k]) => categories[k])
      .map(([k, v]) => ({ key: k, label: `${v}(${categories[k]})` })),
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 0', overflow: 'auto', whiteSpace: 'nowrap' }}>
        <Space size={4} wrap>
          {categoryTabs.map(tab => (
            <Tag
              key={tab.key}
              color={activeCategory === tab.key ? 'blue' : undefined}
              style={{ cursor: 'pointer', fontSize: 13, padding: '2px 10px', margin: 0 }}
              onClick={() => setActiveCategory(tab.key)}
            >
              {tab.label}
            </Tag>
          ))}
        </Space>
      </div>
      <Divider style={{ margin: '4px 0' }} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading && announcements.length === 0 ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : announcements.length === 0 ? (
          <Empty description="暂无校园资讯" />
        ) : (
          <List
            dataSource={announcements}
            loadMore={
              announcements.length < total ? (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <Button onClick={loadMore} loading={loading}>加载更多</Button>
                </div>
              ) : undefined
            }
            renderItem={(item: any) => (
              <List.Item
                style={{ cursor: 'pointer', padding: '12px 8px' }}
                onClick={() => window.open(item.sourceUrl, '_blank')}
              >
                <List.Item.Meta
                  title={
                    <Space size={4}>
                      {item.category && (
                        <Tag color={CATEGORY_COLORS[item.category] || 'default'} style={{ fontSize: 11, lineHeight: '18px' }}>
                          {CATEGORY_LABELS[item.category] || item.category}
                        </Tag>
                      )}
                      <Text strong style={{ fontSize: 14 }}>{item.title}</Text>
                    </Space>
                  }
                  description={
                    <div>
                      {item.summary && (
                        <Paragraph ellipsis={{ rows: 1 }} style={{ margin: '4px 0', color: '#666', fontSize: 12 }}>
                          {item.summary}
                        </Paragraph>
                      )}
                      <Space size={8} style={{ fontSize: 11, color: '#999' }}>
                        {item.publishDate && <span>{formatDate(item.publishDate)}</span>}
                        {item.sourceDept && <span>{item.sourceDept.replace(/color=#808080>/g, '')}</span>}
                        {item.eventDate && <span style={{ color: '#1677ff' }}>活动: {formatDate(item.eventDate)}</span>}
                        {item.deadline && <span style={{ color: '#ff4d4f' }}>截止: {formatDate(item.deadline)}</span>}
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
}

export default function MessageList() {
  const { peerId } = useParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activePeer, setActivePeer] = useState<number | null>(peerId ? Number(peerId) : null);
  const [activePeerName, setActivePeerName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('chat');
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

  const chatContent = (
    <div style={{ display: 'flex', height: '100%' }}>
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
                    title={
                      <Space size={4}>
                        <span>{conv.peer?.username}</span>
                        {conv.orderId && <Tag color="blue" style={{ fontSize: 10, lineHeight: '16px' }}>订单</Tag>}
                        {conv.type === 'system' && <Tag color="orange" style={{ fontSize: 10, lineHeight: '16px' }}>系统</Tag>}
                      </Space>
                    }
                    description={<Text ellipsis style={{ maxWidth: isMobile ? 240 : 160 }}>{conv.lastMessage}</Text>}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      )}

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

  // Unified height calculation
  const containerHeight = isMobile ? 'calc(100dvh - 120px - 56px)' : 'calc(100vh - 180px - 60px)';

  return (
    <div style={{ height: containerHeight }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ height: '100%' }}
        tabBarStyle={{ marginBottom: 0 }}
        items={[
          {
            key: 'chat',
            label: <span><Badge size="small" offset={[6, -2]}><BellOutlined /></Badge> 会话</span>,
            children: <div style={{ height: 'calc(100% - 46px)' }}>{chatContent}</div>,
          },
          {
            key: 'news',
            label: '📢 校园资讯',
            children: <div style={{ height: 'calc(100% - 46px)', padding: '0 4px' }}><AnnouncementPanel /></div>,
          },
        ]}
      />
    </div>
  );
}
