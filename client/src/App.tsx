import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AppContainer from './components/AppContainer';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NavigateSetter from './components/NavigateSetter';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <AppContainer />,
        <NavigateSetter />
      </>
    ),
    children: [
      {
        index: true,
        path: '/',
        element: <Profile />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
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
  return (
    <>
      <RouterProvider router={router} />;
    </>
  );
}

export default App;
