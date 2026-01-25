import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { AuthLayout } from '../components/layout/AuthLayout';
import { MainLayout } from '../components/layout/MainLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ActivatePage } from '../pages/auth/ActivatePage';

// Reservation Pages
import { CalendarPage } from '../pages/reservation/CalendarPage';
import { HistoryPage } from '../pages/reservation/HistoryPage';

// Ticket Pages
import { TicketPage } from '../pages/ticket/TicketPage';

// Admin Pages
import { OrderPage } from '../pages/admin/OrderPage';
import { GuestReservationPage } from '../pages/admin/GuestReservationPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'activate',
        element: <ActivatePage />,
      },
    ],
  },
  {
    element: <MainLayout pageTitle="予約カレンダー" />,
    children: [
      {
        path: 'calendar',
        element: <CalendarPage />,
      },
    ],
  },
  {
    element: <MainLayout pageTitle="予約履歴" />,
    children: [
      {
        path: 'history',
        element: <HistoryPage />,
      },
    ],
  },
  {
    element: <MainLayout pageTitle="チケット管理" />,
    children: [
      {
        path: 'tickets',
        element: <TicketPage />,
      },
    ],
  },
  {
    element: <MainLayout pageTitle="注文管理" />,
    children: [
      {
        path: 'admin/orders',
        element: <OrderPage />,
      },
    ],
  },
  {
    element: <MainLayout pageTitle="ゲスト予約" />,
    children: [
      {
        path: 'admin/guest',
        element: <GuestReservationPage />,
      },
    ],
  },
  {
    element: <MainLayout pageTitle="ユーザー管理" />,
    children: [
      {
        path: 'admin/users',
        element: <UserManagementPage />,
      },
    ],
  },
]);
