import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const SkillList = lazy(() => import('../pages/skills/SkillList'));
const SkillDetail = lazy(() => import('../pages/skills/SkillDetail'));
const SkillCreate = lazy(() => import('../pages/skills/SkillCreate'));
const DemandList = lazy(() => import('../pages/demands/DemandList'));
const DemandDetail = lazy(() => import('../pages/demands/DemandDetail'));
const DemandCreate = lazy(() => import('../pages/demands/DemandCreate'));
const OrderList = lazy(() => import('../pages/orders/OrderList'));
const OrderDetail = lazy(() => import('../pages/orders/OrderDetail'));
const MessageList = lazy(() => import('../pages/messages/MessageList'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const UserProfilePage = lazy(() => import('../pages/profile/UserProfilePage'));
const NotificationPage = lazy(() => import('../pages/notifications/NotificationPage'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div style={{ textAlign: 'center', padding: 100 }}>加载中...</div>}>
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>,
  },
  {
    path: '/register',
    element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper>,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <SuspenseWrapper><HomePage /></SuspenseWrapper> },
      { path: 'skills', element: <SuspenseWrapper><SkillList /></SuspenseWrapper> },
      { path: 'skills/create', element: <ProtectedRoute><SuspenseWrapper><SkillCreate /></SuspenseWrapper></ProtectedRoute> },
      { path: 'skills/:id', element: <SuspenseWrapper><SkillDetail /></SuspenseWrapper> },
      { path: 'skills/:id/edit', element: <ProtectedRoute><SuspenseWrapper><SkillCreate /></SuspenseWrapper></ProtectedRoute> },
      { path: 'demands', element: <SuspenseWrapper><DemandList /></SuspenseWrapper> },
      { path: 'demands/create', element: <ProtectedRoute><SuspenseWrapper><DemandCreate /></SuspenseWrapper></ProtectedRoute> },
      { path: 'demands/:id', element: <SuspenseWrapper><DemandDetail /></SuspenseWrapper> },
      { path: 'orders', element: <ProtectedRoute><SuspenseWrapper><OrderList /></SuspenseWrapper></ProtectedRoute> },
      { path: 'orders/:id', element: <ProtectedRoute><SuspenseWrapper><OrderDetail /></SuspenseWrapper></ProtectedRoute> },
      { path: 'messages', element: <ProtectedRoute><SuspenseWrapper><MessageList /></SuspenseWrapper></ProtectedRoute> },
      { path: 'messages/:peerId', element: <ProtectedRoute><SuspenseWrapper><MessageList /></SuspenseWrapper></ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute><SuspenseWrapper><ProfilePage /></SuspenseWrapper></ProtectedRoute> },
      { path: 'users/:id', element: <SuspenseWrapper><UserProfilePage /></SuspenseWrapper> },
      { path: 'notifications', element: <ProtectedRoute><SuspenseWrapper><NotificationPage /></SuspenseWrapper></ProtectedRoute> },
    ],
  },
]);

export default router;
