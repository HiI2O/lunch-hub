import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  pageTitle: string;
}

// モック用のユーザー情報
const mockUser = {
  name: '山田 太郎',
  role: 'ADMINISTRATOR' as const,
};

export function MainLayout({ pageTitle }: MainLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar userRole={mockUser.role} />
      <div className="main-content">
        <Header title={pageTitle} userName={mockUser.name} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
