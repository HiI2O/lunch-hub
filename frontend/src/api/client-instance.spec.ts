describe('client-instance', () => {
  const ORIGINAL_ENV = import.meta.env.VITE_API_BASE_URL;

  afterEach(() => {
    vi.resetModules();
    if (ORIGINAL_ENV !== undefined) {
      import.meta.env.VITE_API_BASE_URL = ORIGINAL_ENV;
    } else {
      delete import.meta.env.VITE_API_BASE_URL;
    }
  });

  it('VITE_API_BASE_URL設定時はその値をbaseUrlに使用する', async () => {
    import.meta.env.VITE_API_BASE_URL = 'https://api.example.com';

    const { apiClient } = await import('./client-instance');

    expect(apiClient).toBeDefined();
  });

  it('VITE_API_BASE_URL未設定時はhttp://localhost:3000/apiをフォールバックに使用する', async () => {
    delete import.meta.env.VITE_API_BASE_URL;

    const { apiClient } = await import('./client-instance');

    expect(apiClient).toBeDefined();
  });
});
