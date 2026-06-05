import { useState } from 'react';
import { Card, Form, Input, InputNumber, DatePicker, Select, Button, Typography, message as antMsg } from 'antd';
import { useNavigate } from 'react-router-dom';
import { demandService } from '../../services/demandService';

const { Title } = Typography;
const { TextArea } = Input;

const campusOptions = ['粤海校区', '丽湖校区', '沧海校区', '不限'];
import dayjs from 'dayjs';

export default function DemandCreate() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const data = {
      ...values,
      tags: values.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      deadline: values.deadline.format('YYYY-MM-DD'),
    };
    setLoading(true);
    try {
      const res = await demandService.create(data);
      const matches = res.data?.matches;
      antMsg.success(`发布成功，为您匹配到${matches?.length || 0}个技能`);
      if (res.data?.id) {
        navigate(`/demands/${res.data.id}`);
      } else {
        navigate('/demands');
      }
    } catch { /* handled */ } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 8px' }}>
      <Card>
        <Title level={4}>发布需求</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="需求标题" rules={[{ required: true }]}>
            <Input placeholder="如：需要Python辅导" maxLength={100} />
          </Form.Item>
          <Form.Item name="tags" label="标签（逗号分隔）" rules={[{ required: true }]}>
            <Input placeholder="如：Python,编程,数据分析" />
          </Form.Item>
          <Form.Item name="description" label="详细描述" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="详细描述你的需求" maxLength={1000} />
          </Form.Item>
          <Form.Item name="budget" label="预算（元）" rules={[{ required: true }]}>
            <InputNumber min={0} max={200} step={0.01} style={{ width: '100%' }} placeholder="0-200元" />
          </Form.Item>
          <Form.Item name="deadline" label="截止日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="campus" label="校区" rules={[{ required: true }]}>
            <Select options={campusOptions.map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>发布需求（自动匹配技能）</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
