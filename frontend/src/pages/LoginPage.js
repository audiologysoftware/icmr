import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './LoginPage.css'
import Button from '../components/controllers/Button';
import {AuthenticateUser} from '../utils/userData';  

function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async() => {
    if (userId && password) {
      const status = await AuthenticateUser(userId, password);
      if(status==="200")
        navigate('/home'); 
      else
        alert("Invalid Credentials");
    }
  };
  

  return (
   
      <div className="container">
        <h1>Login </h1>
        <div className="input-group">
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button buttonName = "Login" handleClick={handleLogin}/>
      </div>
    
  );
}

export default LoginPage;
