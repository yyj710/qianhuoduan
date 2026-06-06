import { useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Badge, Avatar, Dropdown, theme } from 'antd';
import {
  HomeOutlined, ToolOutlined, FileSearchOutlined,
  ShoppingCartOutlined, MessageOutlined, UserOutlined, LogoutOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { setUnreadCount } from '../store/messageSlice';
import { messageService } from '../services/messageService';

const { Header, Content } = Layout;

const menuItems = [
  { key: '/', icon: HomeOutlined, label: '首页' },
  { key: '/skills', icon: ToolOutlined, label: '技能市场' },
  { key: '/demands', icon: FileSearchOutlined, label: '需求大厅' },
  { key: '/orders', icon: ShoppingCartOutlined, label: '我的订单' },
  { key: '/messages', icon: MessageOutlined, label: '消息' },
];

export default function AppLayout() {
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

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  const selectedKey = '/' + location.pathname.split('/')[1];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontWeight: 'bold', fontSize: 18, cursor: 'pointer' }} onClick={() => navigate('/')}>
          🏫 深技联
        </span>
        <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => key === 'logout' ? handleLogout() : navigate('/profile') }}>
          <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar icon={<UserOutlined />} src={user?.avatar} />
            <span className="hide-on-mobile">{user?.username || '用户'}</span>
          </span>
        </Dropdown>
      </Header>

      <Content style={{ margin: 'var(--content-margin)', padding: 'var(--content-padding)', paddingBottom: 'calc(var(--bottom-bar-height) + var(--content-padding))', background: colorBgContainer, borderRadius: borderRadiusLG, minHeight: 280 }}>
        <Outlet />
      </Content>

      {/* Bottom TabBar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 'var(--bottom-bar-height)',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          width: '100%', maxWidth: 600, height: '100%',
        }}>
          {menuItems.map(({ key, icon: Icon, label }) => {
            const active = selectedKey === key || (key === '/messages' && selectedKey === '/messages');
            return (
              <div
                key={key}
                onClick={() => navigate(key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 2, cursor: 'pointer', flex: 1, height: '100%',
                  color: active ? '#1677ff' : '#999',
                  userSelect: 'none',
                }}
              >
                {key === '/messages' ? (
                  <Badge count={unreadCount} size="small" offset={[4, -2]}>
                    <Icon style={{ fontSize: 22 }} />
                  </Badge>
                ) : (
                  <Icon style={{ fontSize: 22 }} />
                )}
                <span style={{ fontSize: 10, lineHeight: 1 }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
