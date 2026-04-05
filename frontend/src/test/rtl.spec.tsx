import { render, screen } from '@testing-library/react';

function HelloWorld(): React.JSX.Element {
  return <h1>Hello, World!</h1>;
}

describe('React Testing Library', () => {
  it('コンポーネントをレンダリングできる', () => {
    render(<HelloWorld />);
    expect(screen.getByRole('heading')).toHaveTextContent('Hello, World!');
  });
});
