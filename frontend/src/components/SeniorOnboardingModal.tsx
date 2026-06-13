import { useEffect, useState } from 'react';
import { Modal, Button, Typography, Space, Steps } from 'antd';
import { ToolOutlined, RocketOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { skillService } from '../services/skillService';

const { Title, Text, Paragraph } = Typography;

const SENIOR_IDENTITIES = ['大三', '大四', '研究生', '校友'];

export default function SeniorOnboardingModal() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [open, setOpen] = useState(false);
  const [skillCount, setSkillCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const dismissed = localStorage.getItem('onboarding_dismissed');
    if (dismissed) return;
    if (!SENIOR_IDENTITIES.includes(user.identity || '')) return;

    // Check if user has published any skills
    skillService.list({ pageSize: 1 }).then(res => {
      const count = res.data.total || 0;
      setSkillCount(count);
      if (count === 0) setOpen(true);
    }).catch(() => {});
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem('onboarding_dismissed', '1');
    setOpen(false);
  };

  const handlePublish = () => {
    setOpen(false);
    navigate('/skills/create');
  };

  return (
    <Modal
      open={open}
      onCancel={handleDismiss}
      footer={null}
      width={420}
      centered
    >
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <RocketOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
        <Title level={3} style={{ marginBottom: 8 }}>学长/学姐，分享你的经验吧！</Title>
        <Paragraph type="secondary" style={{ fontSize: 14 }}>
          作为{user?.identity}，你拥有丰富的经验和技能。
          <br />
          发布你的第一个技能，帮助学弟学妹们少走弯路！
        </Paragraph>

        <Steps
          direction="vertical"
          size="small"
          current={-1}
          style={{ textAlign: 'left', marginTop: 16, marginBottom: 16 }}
          items={[
            { title: '选择你擅长的领域', description: '学业辅导、考研、求职、技术等' },
            { title: '描述你的技能', description: '价格、介绍、标签等' },
            { title: '等待需求方找到你', description: '系统会自动推送给匹配的用户' },
          ]}
        />

        <Space>
          <Button onClick={handleDismiss}>稍后再说</Button>
          <Button type="primary" icon={<ToolOutlined />} onClick={handlePublish}>
            立即发布技能
          </Button>
        </Space>
      </div>
    </Modal>
  );
}