import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('role="status"で表示される', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('aria-labelを指定できる', () => {
    render(<LoadingSpinner label="now loading" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'now loading');
  });

  it('デフォルトのaria-labelが設定される', () => {
    render(<LoadingSpinner />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-label');
    expect(el.getAttribute('aria-label')).toBeTruthy();
  });
});
