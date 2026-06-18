import React, { useEffect } from 'react';
import axios from 'axios';

const AuthGad = ({ token, userId }) => {
  useEffect(() => {
    const sendPostRequest = async () => {
      if (token && userId) {
        await axios.post('http://127.0.0.1:8000/api/gadcheck/', {
          user_id: userId
        }, {
          headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' }
        });
      }
    };

    sendPostRequest();  // Call the async function
  }, [token, userId]);

  return null; // This component doesn't render anything
};

export default AuthGad;
