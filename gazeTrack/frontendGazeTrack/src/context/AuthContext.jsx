import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');
    const storedIsFilled = localStorage.getItem('is_filled');

    setIsAuthenticated(!!storedToken); 

    if ((storedToken !== null && storedUserId !== null) && (storedIsFilled === '0')) {
      navigate('/gadpage');
    }
  }, [navigate]);  // Add necessary dependencies

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
