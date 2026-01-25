import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

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
    </div>
  );
}
