import axios from 'axios';
import queryClient from './queryClient';
import { getNavigate } from '../lib/navigateService';

const options = {
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
};

const TokenRefreshToken = axios.create(options);
TokenRefreshToken.interceptors.response.use((response) => response.data);

const API = axios.create(options);

API.interceptors.response.use(
  // do something with the response - any status code that is 2xx
  (response) => response.data,
  // do something with the error - any status code outside 2xx
  // here we handle the refreshToken
  async (error) => {
    const { config, response } = error;
    const { status, data } = response || {};

    // try to refresh access token behind the scenes
    if (status === 401 && data?.errorCode === 'InvalidAccessToken')
      try {
        await TokenRefreshToken.get('/auth/refresh');
        return TokenRefreshToken(config);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // delete data in cache
        queryClient.clear();

        // redirect to login
        const navigate = getNavigate();
        if (navigate) {
          navigate('/login', {
            state: {
              redirectUrl: window.location.pathname,
            },
          });
        }
      }

    return Promise.reject({ status, ...data });
  }
);

export default API;
