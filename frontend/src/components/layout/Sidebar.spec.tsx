import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context-value';
import type { AuthContextValue } from '../../contexts/auth-context-value';
import type { UserRole } from '../../api/types';
import { Sidebar } from './Sidebar';

const noop = async (): Promise<void> => {};

function renderSidebar(role: UserRole): void {
  const value: AuthContextValue = {
    user: { id: '1', email: 'test@example.com', displayName: 'Test', role },
    isAuthenticated: true,
    isLoading: false,
    login: noop,
    logout: noop,
    updateUser: () => {},
  };

  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('Sidebar', () => {
  it('GENERAL_USER: カレンダー、履歴、チケットのメニューが表示される', () => {
    renderSidebar('GENERAL_USER');
    expect(screen.getByText('予約カレンダー')).toBeInTheDocument();
    expect(screen.getByText('予約履歴')).toBeInTheDocument();
    expect(screen.getByText('チケット管理')).toBeInTheDocument();
  });

  it('GENERAL_USER: 管理メニューが表示されない', () => {
    renderSidebar('GENERAL_USER');
    expect(screen.queryByText('注文管理')).not.toBeInTheDocument();
    expect(screen.queryByText('ゲスト予約')).not.toBeInTheDocument();
    expect(screen.queryByText('ユーザー管理')).not.toBeInTheDocument();
  });

  it('STAFF: 一般メニュー + 注文管理、ゲスト予約が表示される', () => {
    renderSidebar('STAFF');
    expect(screen.getByText('予約カレンダー')).toBeInTheDocument();
    expect(screen.getByText('注文管理')).toBeInTheDocument();
    expect(screen.getByText('ゲスト予約')).toBeInTheDocument();
    expect(screen.queryByText('ユーザー管理')).not.toBeInTheDocument();
  });

  it('ADMINISTRATOR: すべてのメニューが表示される', () => {
    renderSidebar('ADMINISTRATOR');
    expect(screen.getByText('予約カレンダー')).toBeInTheDocument();
    expect(screen.getByText('注文管理')).toBeInTheDocument();
    expect(screen.getByText('ゲスト予約')).toBeInTheDocument();
    expect(screen.getByText('ユーザー管理')).toBeInTheDocument();
  });
});
