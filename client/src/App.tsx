import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Hello world</div>,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/email/verify/:code',
    element: <VerifyEmail />,
  },
  {
    path: '/password/forgot',
    element: <ForgotPassword />,
  },
  {
    path: '/password/reset',
    element: <ResetPassword />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
