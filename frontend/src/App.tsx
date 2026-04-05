import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { router, apiClient } from './routes';
import './styles/mock.css';

function App() {
  return (
    <AuthProvider client={apiClient}>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
