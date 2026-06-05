import { useEffect, useState } from 'react';
import { Card, Descriptions, Button, Form, Input, Select, message as antMsg, Tag, Avatar, Space, Spin, Tabs } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/authSlice';
import { authService } from '../../services/authService';
import { skillService } from '../../services/skillService';

const campusOptions = ['粤海校区', '丽湖校区', '沧海校区'];

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mySkills, setMySkills] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    authService.getProfile().then(res => setProfile(res.data));
    skillService.list({ pageSize: 100 }).then(res => {
      setMySkills(res.data.list.filter((s: any) => s.userId === user?.id));
    });
  }, [user?.id]);

  const handleEdit = () => {
    form.setFieldsValue({
      phone: profile?.phone,
      college: profile?.college,
      campus: profile?.campus,
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
              <h2>{profile.username}</h2>
              <Tag color={profile.role === 'admin' ? 'red' : 'blue'}>{profile.role === 'admin' ? '管理员' : '用户'}</Tag>
            </div>
          </Space>
          {!editing && <Button icon={<EditOutlined />} onClick={handleEdit}>编辑资料</Button>}
        </div>

        {editing ? (
          <Form form={form} layout="vertical" onFinish={handleSave}>
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
            <Descriptions.Item label="手机号">{profile.phone || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="院系">{profile.college || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="校区">{profile.campus || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="在线状态">{profile.onlineStatus === 1 ? '🟢在线' : '⚫离线'}</Descriptions.Item>
            <Descriptions.Item label="注册时间">{new Date(profile.createTime).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="最后活跃">{profile.lastActiveTime ? new Date(profile.lastActiveTime).toLocaleString() : '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      <Card style={{ marginTop: 16 }} title="我的技能">
        {mySkills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>暂未发布技能</div>
        ) : (
          mySkills.map((s: any) => (
            <Card key={s.id} size="small" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{s.title}</strong>
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
        )}
      </Card>
    </div>
  );
}
