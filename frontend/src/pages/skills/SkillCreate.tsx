import { useState, useEffect, useCallback } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Typography, Steps, message as antMsg } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { skillService } from '../../services/skillService';
import { useDraftSave } from '../../hooks/useDraftSave';

const { Title } = Typography;
const { TextArea } = Input;

const campusOptions = ['粤海校区', '丽湖校区', '沧海校区', '不限'];
const deliveryOptions = ['当日', '1天', '2天', '3天'];

const DESC_TEMPLATE = `【我能提供的服务】


【服务方式】
（线上/线下/均可，时间安排）

【适用对象】
`;

export default function SkillCreate() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { save, clear } = useDraftSave(isEdit ? '' : 'skill_create', form, !isEdit);

  useEffect(() => {
    if (isEdit) {
      skillService.getById(Number(id)).then(res => {
        const skill = res.data;
        form.setFieldsValue({ ...skill, tags: skill.tags || [] });
      });
    }
  }, [id, isEdit, form]);

  const handleTemplate = () => {
    const current = form.getFieldValue('description') || '';
    form.setFieldsValue({ description: current ? current + '\n\n' + DESC_TEMPLATE : DESC_TEMPLATE });
  };

  const onFinish = async (values: any) => {
    const data = {
      ...values,
      tags: values.tags || [],
    };
    setLoading(true);
    try {
      if (isEdit) {
        await skillService.update(Number(id), data);
        antMsg.success('更新成功');
      } else {
        await skillService.create(data);
        antMsg.success('发布成功');
        clear();
      }
      navigate('/skills');
    } catch { /* handled */ } finally { setLoading(false); }
  };

  const tagsValue = Form.useWatch('tags', form);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 8px' }}>
      <Card>
        <Title level={4}>{isEdit ? '编辑技能' : '发布技能'}</Title>

        {!isEdit && (
          <Steps
            current={step}
            size="small"
            style={{ marginBottom: 24 }}
            items={[{ title: '基本信息' }, { title: '服务详情' }]}
          />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={save}>
          {/* Step 0: Basic Info */}
          <div style={{ display: step === 0 ? 'block' : 'none' }}>
            <Form.Item name="title" label="技能标题" rules={[{ required: true, message: '请输入标题' }]}>
              <Input placeholder="如：Python编程辅导" maxLength={100} />
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

            {!isEdit && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={() => navigate('/skills')}>取消</Button>
                <Button type="primary" onClick={() => {
                  form.validateFields(['title', 'tags']).then(() => setStep(1)).catch(() => {});
                }}>下一步 →</Button>
              </div>
            )}
          </div>

          {/* Step 1: Details */}
          <div style={{ display: step === 1 || isEdit ? 'block' : 'none' }}>
            <Form.Item name="description" label="详细描述" rules={[{ required: true, message: '请输入描述' }]}>
              <TextArea rows={5} placeholder="详细描述你的技能、经验和可提供的服务" maxLength={1000} showCount />
            </Form.Item>
            {!isEdit && (
              <Button type="link" size="small" onClick={handleTemplate} style={{ marginTop: -16, marginBottom: 16 }}>
                📋 使用描述模板
              </Button>
            )}
            <Form.Item name="price" label="价格（元）" rules={[{ required: true, message: '请输入价格' }]}>
              <InputNumber min={0} max={200} step={0.01} style={{ width: '100%' }} placeholder="0-200元" />
            </Form.Item>
            <Form.Item name="deliveryTime" label="交付时间" rules={[{ required: true, message: '请选择交付时间' }]}>
              <Select options={deliveryOptions.map(d => ({ label: d, value: d }))} />
            </Form.Item>
            <Form.Item name="campus" label="校区" rules={[{ required: true, message: '请选择校区' }]}>
              <Select options={campusOptions.map(c => ({ label: c, value: c }))} />
            </Form.Item>

            <div style={{ display: 'flex', gap: 8 }}>
              {!isEdit && (
                <Button onClick={() => setStep(0)}>← 上一步</Button>
              )}
              <Button type="primary" htmlType="submit" loading={loading} block>
                {isEdit ? '保存修改' : '立即发布'}
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}
