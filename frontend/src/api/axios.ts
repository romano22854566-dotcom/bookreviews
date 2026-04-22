import axios from 'axios';

const baseURL = () => {

if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  return 'http://localhost:8080';
};
  const api = axios.create({
  baseURL: `${baseURL()}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});
export default api;