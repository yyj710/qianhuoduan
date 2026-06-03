import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import HomePage from '../pages/HomePage';
import SkillList from '../pages/skills/SkillList';
import SkillDetail from '../pages/skills/SkillDetail';
import SkillCreate from '../pages/skills/SkillCreate';
import DemandList from '../pages/demands/DemandList';
import DemandDetail from '../pages/demands/DemandDetail';
import DemandCreate from '../pages/demands/DemandCreate';
import OrderList from '../pages/orders/OrderList';
import OrderDetail from '../pages/orders/OrderDetail';
import MessageList from '../pages/messages/MessageList';
import ProfilePage from '../pages/profile/ProfilePage';
import ProtectedRoute from '../components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'skills', element: <SkillList /> },
      { path: 'skills/create', element: <SkillCreate /> },
      { path: 'skills/:id', element: <SkillDetail /> },
      { path: 'skills/:id/edit', element: <SkillCreate /> },
      { path: 'demands', element: <DemandList /> },
      { path: 'demands/create', element: <DemandCreate /> },
      { path: 'demands/:id', element: <DemandDetail /> },
      { path: 'orders', element: <OrderList /> },
      { path: 'orders/:id', element: <OrderDetail /> },
      { path: 'messages', element: <MessageList /> },
      { path: 'messages/:peerId', element: <MessageList /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
