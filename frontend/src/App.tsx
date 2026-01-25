import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import './styles/mock.css';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
