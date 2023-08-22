import { useState } from 'react';

export default function useToken() {
  const getToken = () => {
    return localStorage.getItem('token');
  };
  
  const [token, setToken] = useState(getToken);

  const saveToken = userToken => {
    localStorage.setItem('token', JSON.stringify(userToken));
    setToken(userToken.token);
  };

  return {
    setToken: saveToken,
    token
  }

}