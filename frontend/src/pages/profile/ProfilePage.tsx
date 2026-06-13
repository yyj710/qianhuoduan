import { useEffect, useState } from 'react';
import { Card, Descriptions, Button, Form, Input, Select, message as antMsg, Tag, Avatar, Space, Spin, Tabs, List, Empty, Rate, Modal } from 'antd';
import { UserOutlined, EditOutlined, HeartOutlined, TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/authSlice';
import { authService } from '../../services/authService';
import { skillService } from '../../services/skillService';
import { bookmarkService } from '../../services/bookmarkService';
import { followService } from '../../services/followService';
import { IDENTITY_OPTIONS, getCategoryLabel } from '../../constants/categories';
import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';
const { Text } = Typography;

const campusOptions = ['粤海校区', '丽湖校区', '沧海校区'];

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mySkills, setMySkills] = useState<any[]>([]);
  const [myComments, setMyComments] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('skills');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyInfo, setVerifyInfo] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleApplyVerify = async () => {
    if (!verifyInfo.trim()) { antMsg.warning('请填写认证信息'); return; }
    setVerifyLoading(true);
    try {
      await authService.applyVerify(verifyInfo);
      antMsg.success('认证申请已提交');
      setVerifyModalOpen(false);
      // refresh profile
      const res = await authService.getProfile();
      setProfile(res.data);
    } catch (e: any) {
      antMsg.error(e?.response?.data?.message || '申请失败');
    } finally { setVerifyLoading(false); }
  };


  useEffect(() => {
    authService.getProfile().then(res => setProfile(res.data));
    skillService.list({ pageSize: 100 }).then(res => {
      setMySkills(res.data.list.filter((s: any) => s.userId === user?.id));
    });
  }, [user?.id]);

  const loadBookmarks = async () => {
    try {
      const res = await bookmarkService.list();
      setBookmarks(res.data);
    } catch { /* ignore */ }
  };

  const loadFollowing = async () => {
    try {
      const res = await followService.following(user!.id);
      setFollowing(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (activeTab === 'bookmarks') loadBookmarks();
    if (activeTab === 'following') loadFollowing();
  }, [activeTab]);

  const handleEdit = () => {
    form.setFieldsValue({
      phone: profile?.phone,
      college: profile?.college,
      campus: profile?.campus,
      identity: profile?.identity,
      bio: profile?.bio,
      major: profile?.major,
    });
    setEditing(true);
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const res = await authService.updateProfile(values);
      dispatch(updateUser(res.data));
      setProfile(res.data);
      setEditing(false);
      antMsg.success('保存成功');
    } catch { /* handled */ } finally { setLoading(false); }
  };

  if (!profile) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Space wrap>
            <Avatar size={64} icon={<UserOutlined />} src={profile.avatar} />
            <div>
              <h2>
                {profile.username}
                {profile.verified && <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>✓已认证</Tag>}
              </h2>
              <Space size={4}>
                {profile.identity && <Tag color="purple">{profile.identity}</Tag>}
                <Tag color={profile.role === 'admin' ? 'red' : 'blue'}>{profile.role === 'admin' ? '管理员' : '用户'}</Tag>
                {profile.college && <Tag>{profile.college}</Tag>}
              </Space>
              {profile.bio && <div style={{ color: '#666', marginTop: 4, fontSize: 13 }}>{profile.bio}</div>}
            </div>
          </Space>
          {!editing && <Button icon={<EditOutlined />} onClick={handleEdit}>编辑资料</Button>}
        </div>

        {editing ? (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="identity" label="年级">
              <Select options={IDENTITY_OPTIONS} allowClear placeholder="选择年级" />
            </Form.Item>
            <Form.Item name="major" label="专业"><Input placeholder="你的专业" /></Form.Item>
            <Form.Item name="bio" label="个人简介"><Input.TextArea rows={3} placeholder="介绍一下自己..." maxLength={200} showCount /></Form.Item>
            <Form.Item name="phone" label="手机号"><Input /></Form.Item>
            <Form.Item name="college" label="院系"><Input /></Form.Item>
            <Form.Item name="campus" label="校区">
              <Select options={campusOptions.map(c => ({ label: c, value: c }))} />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
              <Button onClick={() => setEditing(false)}>取消</Button>
            </Space>
          </Form>
        ) : (
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label="用户名">{profile.username}</Descriptions.Item>
            <Descriptions.Item label="信用评分">⭐ {profile.creditScore?.toFixed(1)}</Descriptions.Item>
            <Descriptions.Item label="年级">{profile.identity || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="专业">{profile.major || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="手机号">{profile.phone || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="院系">{profile.college || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="校区">{profile.campus || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="在线状态">{profile.onlineStatus === 1 ? '🟢在线' : '⚫离线'}</Descriptions.Item>
            <Descriptions.Item label="注册时间">{new Date(profile.createTime).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="最后活跃">{profile.lastActiveTime ? new Date(profile.lastActiveTime).toLocaleString() : '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          {
            key: 'skills',
            label: `我的技能 (${mySkills.length})`,
            children: mySkills.length === 0 ? (
              <Empty description="暂未发布技能" />
            ) : (
              mySkills.map((s: any) => (
                <Card key={s.id} size="small" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => navigate(`/skills/${s.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{s.title}</strong>
                      {s.category && <Tag color="blue" style={{ marginLeft: 8 }}>{getCategoryLabel(s.category)}</Tag>}
                      <div style={{ marginTop: 4 }}>
                        {s.tags?.map((t: string) => <Tag key={t} color="blue">{t}</Tag>)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#f5222d', fontWeight: 'bold' }}>¥{s.price}</div>
                      <div style={{ color: '#999' }}>{s.viewCount}浏览 | {s.dealCount}成交</div>
                    </div>
                  </div>
                </Card>
              ))
            ),
          },
          {
            key: 'bookmarks',
            label: <span><HeartOutlined /> 收藏</span>,
            children: bookmarks.length === 0 ? (
              <Empty description="暂无收藏" />
            ) : (
              <List dataSource={bookmarks} renderItem={(b: any) => (
                <List.Item style={{ cursor: 'pointer' }} onClick={() => navigate(`/${b.targetType === 'skill' ? 'skills' : 'demands'}/${b.targetId}`)}>
                  <List.Item.Meta
                    title={<span>{b.targetType === 'skill' ? '🎯 技能' : '📋 需求'} #{b.targetId}</span>}
                    description={new Date(b.createTime).toLocaleDateString()}
                  />
                </List.Item>
              )} />
            ),
          },
          {
            key: 'following',
            label: <span><TeamOutlined /> 关注</span>,
            children: following.length === 0 ? (
              <Empty description="暂未关注任何人" />
            ) : (
              <List dataSource={following} renderItem={(f: any) => (
                <List.Item style={{ cursor: 'pointer' }} onClick={() => navigate(`/users/${f.following?.id}`)}>
                  <List.Item.Meta
                    avatar={<Avatar src={f.following?.avatar} icon={<UserOutlined />} />}
                    title={f.following?.username}
                    description={`${f.following?.identity || ''} ${f.following?.college || ''}`}
                  />
                </List.Item>
              )} />
            ),
          },
        ]} />
      </Card>

      {/* Verify Section */}
      {!profile.verified && !profile.verifyInfo && (
        <Card style={{ marginTop: 16, textAlign: 'center' }}>
          <SafetyCertificateOutlined style={{ fontSize: 32, color: '#1677ff', marginBottom: 8 }} />
          <div><Text type="secondary">认证你的身份，让其他同学更信任你</Text></div>
          <Button type="primary" style={{ marginTop: 8 }} onClick={() => setVerifyModalOpen(true)}>申请认证</Button>
        </Card>
      )}
      {profile.verifyInfo && !profile.verified && (
        <Card style={{ marginTop: 16, textAlign: 'center' }}>
          <Tag color="orange" style={{ fontSize: 14, padding: '4px 12px' }}>认证审核中...</Tag>
        </Card>
      )}

      <Modal
        title="申请身份认证"
        open={verifyModalOpen}
        onCancel={() => setVerifyModalOpen(false)}
        onOk={handleApplyVerify}
        confirmLoading={verifyLoading}
      >
        <div style={{ marginBottom: 8 }}><Text type="secondary">请提供能证明你身份的信息，如学号、学生证照片描述、学院+年级+专业等</Text></div>
        <Input.TextArea
          rows={3}
          placeholder="例如：2021级 计算机与软件学院 计算机科学与技术专业"
          value={verifyInfo}
          onChange={e => setVerifyInfo(e.target.value)}
          maxLength={200}
          showCount
        />
      </Modal>
    </div>
  );
}
