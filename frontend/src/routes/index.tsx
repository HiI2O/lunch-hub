import { createBrowserRouter, Navigate } from 'react-router-dom';
import { createReservationApi } from '../api/reservation';
import { createStaffReservationApi } from '../api/staff-reservation';
import { createTicketApi } from '../api/ticket';
import { createOrderApi } from '../api/order';
import { createAdminUserApi } from '../api/admin-user';

// Layouts
import { AuthLayout } from '../components/layout/AuthLayout';
import { MainLayout } from '../components/layout/MainLayout';

// Guards
import { AuthGuard } from '../guards/AuthGuard';
import { RoleGuard } from '../guards/RoleGuard';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ActivatePage } from '../pages/auth/ActivatePage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { ChangePasswordPage } from '../pages/auth/ChangePasswordPage';

// Reservation Pages
import { CalendarPage } from '../pages/reservation/CalendarPage';
import { HistoryPage } from '../pages/reservation/HistoryPage';

// Ticket Pages
import { TicketPage } from '../pages/ticket/TicketPage';

// Admin Pages
import { OrderPage } from '../pages/admin/OrderPage';
import { GuestReservationPage } from '../pages/admin/GuestReservationPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';

// API Client instances
import { apiClient } from '../api/client-instance';

const reservationApi = createReservationApi(apiClient);
const staffReservationApi = createStaffReservationApi(apiClient);
const ticketApi = createTicketApi(apiClient);
const orderApi = createOrderApi(apiClient);
const adminUserApi = createAdminUserApi(apiClient);

export { apiClient };

export const router = createBrowserRouter([
  // デフォルト: /calendar へリダイレクト（未認証はAuthGuardが/loginへ転送）
  {
    path: '/',
    element: <Navigate to="/calendar" replace />,
  },

  // --- 公開ルート（AuthLayout） ---
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'activate', element: <ActivatePage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // --- 認証必須ルート（AuthGuard > MainLayout > Outlet） ---
  {
    element: <AuthGuard />,
    children: [
      {
        element: <MainLayout />,
        children: [
          // 一般ユーザーもアクセス可能
          { path: 'calendar', element: <CalendarPage reservationApi={reservationApi} /> },
          { path: 'history', element: <HistoryPage reservationApi={reservationApi} /> },
          { path: 'tickets', element: <TicketPage ticketApi={ticketApi} /> },
          { path: 'settings/password', element: <ChangePasswordPage /> },

          // STAFF + ADMINISTRATOR
          {
            element: <RoleGuard roles={['STAFF', 'ADMINISTRATOR']} />,
            children: [
              { path: 'admin/orders', element: <OrderPage orderApi={orderApi} /> },
              { path: 'admin/guest', element: <GuestReservationPage staffReservationApi={staffReservationApi} /> },
            ],
          },

          // ADMINISTRATOR のみ
          {
            element: <RoleGuard roles={['ADMINISTRATOR']} />,
            children: [
              { path: 'admin/users', element: <UserManagementPage adminUserApi={adminUserApi} /> },
            ],
          },
        ],
      },
    ],
  },
]);
