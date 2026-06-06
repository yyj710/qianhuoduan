import { useState } from 'react';
import { Card, Form, Input, InputNumber, DatePicker, Select, Button, Typography, Steps, message as antMsg } from 'antd';
import { useNavigate } from 'react-router-dom';
import { demandService } from '../../services/demandService';
import { useDraftSave } from '../../hooks/useDraftSave';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const campusOptions = ['粤海校区', '丽湖校区', '沧海校区', '不限'];

export default function DemandCreate() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const { save, clear } = useDraftSave('demand_create', form);

  const onFinish = async (values: any) => {
    const data = {
      ...values,
      tags: values.tags || [],
      deadline: values.deadline.format('YYYY-MM-DD'),
    };
    setLoading(true);
    try {
      const res = await demandService.create(data);
      const matches = res.data?.matches;
      antMsg.success(`发布成功，为您匹配到${matches?.length || 0}个技能`);
      clear();
      if (res.data?.id) {
        navigate(`/demands/${res.data.id}`);
      } else {
        navigate('/demands');
      }
    } catch { /* handled */ } finally { setLoading(false); }
  };

  const tagsValue = Form.useWatch('tags', form);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 8px' }}>
      <Card>
        <Title level={4}>发布需求</Title>

        <Steps
          current={step}
          size="small"
          style={{ marginBottom: 24 }}
          items={[{ title: '基本信息' }, { title: '需求详情' }]}
        />

        <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={save}>
          {/* Step 0: Basic Info */}
          <div style={{ display: step === 0 ? 'block' : 'none' }}>
            <Form.Item name="title" label="需求标题" rules={[{ required: true }]}>
              <Input placeholder="如：需要Python辅导" maxLength={100} />
            </Form.Item>
            <Form.Item name="tags" label="标签（输入后按回车添加）" rules={[{ required: true, message: '请至少添加一个标签' }]}>
              <Select
                mode="tags"
                placeholder="输入标签，按回车确认"
                style={{ width: '100%' }}
                tokenSeparators={[',']}
              />
            </Form.Item>
            {tagsValue?.length > 0 && (
              <div style={{ marginTop: -8, marginBottom: 16, color: '#999', fontSize: 12 }}>
                已添加 {tagsValue.length} 个标签
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => navigate('/demands')}>取消</Button>
              <Button type="primary" onClick={() => {
                form.validateFields(['title', 'tags']).then(() => setStep(1)).catch(() => {});
              }}>下一步 →</Button>
            </div>
          </div>

          {/* Step 1: Details */}
          <div style={{ display: step === 1 ? 'block' : 'none' }}>
            <Form.Item name="description" label="详细描述" rules={[{ required: true }]}>
              <TextArea rows={5} placeholder="详细描述你的需求" maxLength={1000} showCount />
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

            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => setStep(0)}>← 上一步</Button>
              <Button type="primary" htmlType="submit" loading={loading} block>发布需求（自动匹配技能）</Button>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}
