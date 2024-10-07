import axios from 'axios';

const options = {
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
};

const API = axios.create(options);

API.interceptors.response.use(
  // do something with the response - any status code that is 2xx
  (response) => response.data,
  // do something with the error - any status code outside 2xx
  (error) => {
    const { status, data } = error.response;
    return Promise.reject({ status, ...data });
  }
);

export default API;
