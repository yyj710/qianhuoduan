import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message as antMsg } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../store/authSlice';
import { authService } from '../../services/authService';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authService.login({ username: values.username, password: values.password });
      dispatch(setAuth({ user: res.data.user, token: res.data.token }));
      antMsg.success('登录成功');
      navigate('/');
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '0 16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card style={{ width: '100%', maxWidth: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>🏫 零费skill</Title>
          <Text type="secondary">技能互助与校园资讯平台</Text>
        </div>
        <Form name="login" onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>登录</Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Text>还没有账号？</Text><Link to="/register">立即注册</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
