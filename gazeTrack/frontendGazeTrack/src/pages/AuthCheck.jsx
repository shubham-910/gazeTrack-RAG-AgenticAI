// AuthCheck.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthCheck = ({ children }) => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!authToken || !userId) {
      navigate('/login');
      toast.error("Login Required !");
    }
  }, [authToken, userId, navigate]);

  return authToken && userId ? children : null;
};

export default AuthCheck;
