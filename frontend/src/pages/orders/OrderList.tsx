import { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, Tag, Typography, Select, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';

const { Title } = Typography;

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'orange', text: '待确认' },
  1: { color: 'blue', text: '进行中' },
  2: { color: 'purple', text: '待评价' },
  3: { color: 'green', text: '已完成' },
  4: { color: 'default', text: '已取消' },
};

export default function OrderList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>('');
  const [status, setStatus] = useState<number | undefined>();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 576);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchList = useCallback(() => {
    setLoading(true);
    orderService.list({ page, pageSize: 10, role: role || undefined, status })
      .then(res => { setOrders(res.data.list); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  }, [page, role, status]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const columns = useMemo(() => {
    const baseCols = [
      ...(isMobile ? [] : [{ title: '订单编号', dataIndex: 'orderNo', key: 'orderNo', width: 180 }]),
      {
        title: '技能', dataIndex: 'skill', key: 'skill',
        render: (skill: any) => skill?.title || '-',
      },
      ...(isMobile ? [] : [
        {
          title: '需求方', dataIndex: 'buyer', key: 'buyer',
          render: (buyer: any) => buyer?.username || '-',
        },
        {
          title: '技能方', dataIndex: 'seller', key: 'seller',
          render: (seller: any) => seller?.username || '-',
        },
      ]),
      {
        title: '金额', dataIndex: 'amount', key: 'amount',
        render: (v: number) => <span style={{ fontWeight: 'bold' }}>¥{v}</span>,
      },
      {
        title: '状态', dataIndex: 'status', key: 'status',
        render: (s: number) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag>,
      },
      ...(isMobile ? [] : [{
        title: '时间', dataIndex: 'createTime', key: 'createTime',
        render: (t: string) => new Date(t).toLocaleDateString(),
      }]),
      {
        title: '操作', key: 'action',
        render: (_: any, record: any) => (
          <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>详情</Button>
        ),
      },
    ];
    return baseCols;
  }, [isMobile, navigate]);

  return (
    <div>
      <Title level={4}>我的订单</Title>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Select placeholder="角色" style={{ width: 120 }} value={role} onChange={v => { setRole(v); setPage(1); }} allowClear
          options={[{ label: '全部', value: '' }, { label: '我买的', value: 'buyer' }, { label: '我卖的', value: 'seller' }]} />
        <Select placeholder="状态" style={{ width: 120 }} value={status} onChange={v => { setStatus(v); setPage(1); }} allowClear
          options={Object.entries(statusMap).map(([k, v]) => ({ label: v.text, value: Number(k) }))} />
      </div>
      <Table
        dataSource={orders} columns={columns} rowKey="id"
        loading={loading} scroll={{ x: isMobile ? 400 : 800 }}
        pagination={{ current: page, total, pageSize: 10, onChange: p => setPage(p) }}
        onRow={(record) => ({ onClick: () => navigate(`/orders/${record.id}`), style: { cursor: 'pointer' } })}
      />
    </div>
  );
}
