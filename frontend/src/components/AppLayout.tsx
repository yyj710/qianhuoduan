import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Avatar, Dropdown, theme } from 'antd';
import {
  HomeOutlined, ToolOutlined, FileSearchOutlined,
  ShoppingCartOutlined, MessageOutlined, UserOutlined,
  LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { setUnreadCount } from '../store/messageSlice';
import { messageService } from '../services/messageService';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const unreadCount = useSelector((state: RootState) => state.message.unreadCount);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const fetchUnread = useCallback(async () => {
    try {
      const res = await messageService.getUnreadCount();
      dispatch(setUnreadCount(res.data.count));
    } catch { /* ignore */ }
  }, [dispatch]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, unreadCount > 0 ? 3000 : 5000);
    return () => clearInterval(interval);
  }, [fetchUnread, unreadCount]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/skills', icon: <ToolOutlined />, label: '技能市场' },
    { key: '/demands', icon: <FileSearchOutlined />, label: '需求大厅' },
    { key: '/orders', icon: <ShoppingCartOutlined />, label: '我的订单' },
    {
      key: '/messages',
      icon: <Badge count={unreadCount} size="small" offset={[2, -2]}><MessageOutlined /></Badge>,
      label: '消息',
    },
  ];

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  const selectedKey = '/' + location.pathname.split('/')[1] || '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} breakpoint="md" onBreakpoint={(b) => setCollapsed(b)}>
        <div style={{ height: 48, margin: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: collapsed ? 14 : 18 }}>
          {collapsed ? '深' : '🏫 深技联'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, cursor: 'pointer' }} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
          <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => key === 'logout' ? handleLogout() : navigate('/profile') }}>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} src={user?.avatar} />
              <span className="hide-on-mobile">{user?.username || '用户'}</span>
            </span>
          </Dropdown>
        </Header>
        <Content style={{ margin: 'var(--content-margin)', padding: 'var(--content-padding)', background: colorBgContainer, borderRadius: borderRadiusLG, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
