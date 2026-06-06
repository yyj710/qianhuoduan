import { useState } from 'react';
import { Card, Form, Input, Button, Select, Typography, message as antMsg } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const { Title, Text } = Typography;

const campusOptions = ['粤海校区', '丽湖校区', '沧海校区'];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      antMsg.error('两次密码输入不一致');
      return;
    }
    setLoading(true);
    try {
      await authService.register(values);
      antMsg.success('注册成功，请登录');
      navigate('/login');
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '0 16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card style={{ width: '100%', maxWidth: 420, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>📝 注册账号</Title>
          <Text type="secondary">加入深圳大学技能互助平台</Text>
        </div>
        <Form name="register" onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }, { min: 3, message: '用户名至少3位' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码（至少6位）" />
          </Form.Item>
          <Form.Item name="confirmPassword" rules={[{ required: true, message: '请确认密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>
          <Form.Item name="phone">
            <Input prefix={<PhoneOutlined />} placeholder="手机号（选填）" />
          </Form.Item>
          <Form.Item name="college">
            <Input placeholder="院系（选填）" />
          </Form.Item>
          <Form.Item name="campus">
            <Select placeholder="选择校区（选填）" allowClear options={campusOptions.map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>注册</Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Text>已有账号？</Text><Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
