describe('テスト基盤', () => {
  it('Vitestが正しく動作する', () => {
    expect(1 + 1).toBe(2);
  });

  it('jsdom環境でDOMが利用できる', () => {
    const div = document.createElement('div');
    div.textContent = 'hello';
    expect(div.textContent).toBe('hello');
  });
});
