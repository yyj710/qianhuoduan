import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Avatar, Tag, Space, Button, Descriptions, List, Empty, Spin, message as antMsg, Divider, Rate } from 'antd';
import { UserOutlined, HeartOutlined, TeamOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { authService } from '../../services/authService';
import { bookmarkService } from '../../services/bookmarkService';
import { followService } from '../../services/followService';
import { getCategoryLabel } from '../../constants/categories';

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [profile, setProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = Number(id);
  const isSelf = user?.id === userId;

  useEffect(() => {
    setLoading(true);
    authService.getPublicProfile(userId).then(res => {
      setProfile(res.data);
    }).catch(() => {
      antMsg.error('用户不存在');
    }).finally(() => setLoading(false));

    if (user && !isSelf) {
      followService.check(userId).then(res => setIsFollowing(res.data.isFollowing)).catch(() => {});
    }
  }, [userId, user?.id]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await followService.unfollow(userId);
        setIsFollowing(false);
        antMsg.success('已取消关注');
      } else {
        await followService.follow(userId);
        setIsFollowing(true);
        antMsg.success('关注成功');
      }
      // Refresh profile for updated counts
      const res = await authService.getPublicProfile(userId);
      setProfile(res.data);
    } catch { /* handled */ }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!profile) return <Empty description="用户不存在" />;

  const u = profile.user;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Space wrap>
            <Avatar size={64} icon={<UserOutlined />} src={u.avatar} />
            <div>
              <h2>
                {u.username}
                {u.verified && <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>✓已认证</Tag>}
              </h2>
              <Space size={4}>
                {u.identity && <Tag color="purple">{u.identity}</Tag>}
                {u.college && <Tag>{u.college}</Tag>}
                {u.campus && <Tag>{u.campus}</Tag>}
              </Space>
              {u.bio && <div style={{ color: '#666', marginTop: 4, fontSize: 13 }}>{u.bio}</div>}
            </div>
          </Space>
          {!isSelf && user && (
            <Button type={isFollowing ? 'default' : 'primary'} onClick={handleFollow}>
              {isFollowing ? '已关注' : '+ 关注'}
            </Button>
          )}
        </div>

        <Descriptions column={{ xs: 1, sm: 3 }} bordered size="small">
          <Descriptions.Item label="信用评分">⭐ {u.creditScore?.toFixed(1)}</Descriptions.Item>
          <Descriptions.Item label="成交订单">{profile.orderCount}单</Descriptions.Item>
          <Descriptions.Item label="专业">{u.major || '未设置'}</Descriptions.Item>
          <Descriptions.Item label="粉丝">{profile.followerCount}</Descriptions.Item>
          <Descriptions.Item label="关注">{profile.followingCount}</Descriptions.Item>
          <Descriptions.Item label="注册时间">{new Date(u.createTime).toLocaleDateString()}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="🎯 TA的技能" style={{ marginTop: 16 }}>
        {profile.skills.length === 0 ? <Empty description="暂未发布技能" /> : (
          profile.skills.map((s: any) => (
            <Card key={s.id} size="small" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => navigate(`/skills/${s.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{s.title}</strong>
                  {s.category && <Tag color="blue" style={{ marginLeft: 8 }}>{getCategoryLabel(s.category)}</Tag>}
                  <div style={{ marginTop: 4 }}>
                    {JSON.parse(s.tags || '[]').map((t: string) => <Tag key={t} color="blue">{t}</Tag>)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#f5222d', fontWeight: 'bold' }}>¥{s.price}</div>
                  <div style={{ color: '#999' }}>{s.viewCount}浏览 | {s.dealCount}成交</div>
                </div>
              </div>
            </Card>
          ))
        )}
      </Card>

      {profile.comments.length > 0 && (
        <Card title="💬 收到的评价" style={{ marginTop: 16 }}>
          <List dataSource={profile.comments} renderItem={(c: any) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar size="small" icon={<UserOutlined />} src={c.user?.avatar} />}
                title={<Space><span>{c.user?.username}</span><Rate disabled value={c.score} style={{ fontSize: 12 }} /></Space>}
                description={c.content || '未留下评价'}
              />
            </List.Item>
          )} />
        </Card>
      )}
    </div>
  );
}
