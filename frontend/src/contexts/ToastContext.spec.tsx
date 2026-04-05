import { render, screen, act } from '@testing-library/react';
import { ToastProvider } from './ToastContext';
import { useToast } from '../hooks/useToast';

function ToastConsumer(): React.JSX.Element {
  const { show } = useToast();
  return (
    <div>
      <button onClick={() => show({ type: 'success', message: 'saved' })}>success</button>
      <button onClick={() => show({ type: 'error', message: 'failed' })}>error</button>
    </div>
  );
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('successトーストが表示される', () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('success').click();
    });

    expect(screen.getByText('saved')).toBeInTheDocument();
  });

  it('errorトーストが表示される', () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('error').click();
    });

    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('successトーストは3秒後に自動で消える', () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('success').click();
    });
    expect(screen.getByText('saved')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('saved')).not.toBeInTheDocument();
  });

  it('errorトーストは自動で��えない', () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('error').click();
    });

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('errorトーストの閉じるボタンで消せる', () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('error').click();
    });
    expect(screen.getByText('failed')).toBeInTheDocument();

    act(() => {
      screen.getByRole('button', { name: /close|閉じる/i }).click();
    });

    expect(screen.queryByText('failed')).not.toBeInTheDocument();
  });

  it('複数のトーストを同時にスタック表示できる', () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('success').click();
    });
    act(() => {
      screen.getByText('error').click();
    });

    expect(screen.getByText('saved')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('ToastProvider外でuseToastを使うとエラーをthrowする', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<ToastConsumer />);
    }).toThrow('useToast must be used within a ToastProvider');

    consoleSpy.mockRestore();
  });
});
