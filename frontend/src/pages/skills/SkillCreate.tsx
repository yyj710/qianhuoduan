import { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Typography, message as antMsg } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { skillService } from '../../services/skillService';

const { Title } = Typography;
const { TextArea } = Input;

const campusOptions = ['粤海校区', '丽湖校区', '沧海校区', '不限'];
const deliveryOptions = ['当日', '1天', '2天', '3天'];

export default function SkillCreate() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      skillService.getById(Number(id)).then(res => {
        const skill = res.data;
        form.setFieldsValue({ ...skill, tags: skill.tags?.join(',') });
      });
    }
  }, [id, isEdit, form]);

  const onFinish = async (values: any) => {
    const data = {
      ...values,
      tags: values.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
    };
    setLoading(true);
    try {
      if (isEdit) {
        await skillService.update(Number(id), data);
        antMsg.success('更新成功');
      } else {
        await skillService.create(data);
        antMsg.success('发布成功');
      }
      navigate('/skills');
    } catch { /* handled */ } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card>
        <Title level={4}>{isEdit ? '编辑技能' : '发布技能'}</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="技能标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="如：Python编程辅导" maxLength={100} />
          </Form.Item>
          <Form.Item name="tags" label="标签（逗号分隔）" rules={[{ required: true, message: '请输入标签' }]}>
            <Input placeholder="如：Python,编程,辅导" />
          </Form.Item>
          <Form.Item name="description" label="详细描述" rules={[{ required: true, message: '请输入描述' }]}>
            <TextArea rows={4} placeholder="详细描述你的技能、经验和可提供的服务" maxLength={1000} />
          </Form.Item>
          <Form.Item name="price" label="价格（元）" rules={[{ required: true, message: '请输入价格' }]}>
            <InputNumber min={0} max={200} step={0.01} style={{ width: '100%' }} placeholder="0-200元" />
          </Form.Item>
          <Form.Item name="deliveryTime" label="交付时间" rules={[{ required: true, message: '请选择交付时间' }]}>
            <Select options={deliveryOptions.map(d => ({ label: d, value: d }))} />
          </Form.Item>
          <Form.Item name="campus" label="校区" rules={[{ required: true, message: '请选择校区' }]}>
            <Select options={campusOptions.map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {isEdit ? '保存修改' : '立即发布'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
