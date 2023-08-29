import React, { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleAuthProvider } from "./fire" 
import { useNavigate } from 'react-router-dom';
import { useAuth } from './checkAuth';

export function Login({ handleGoogleLogin }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('');
  const user = useAuth()
  const [password, setPassword] = useState('');

  useEffect(() => {
    try{
      if(user){
        navigate("/")
      }
    } catch(error){
      alert(error)
    }
  }, [user])

  function handleLogin() {
    signInWithEmailAndPassword(auth, username, password)
    .then((userCredential) => {
      const user = userCredential.user;
      location.reload()
      navigate("/")
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage);
    });
  };

  function handleGoogleLogin(){
    signInWithPopup(auth, googleAuthProvider).then(result => {
      const credenetial = GoogleAuthProvider.credentialFromResult(result)
      const token = credenetial.accessToken;

      const user = result.user;
      console.log(user);
      navigate("/")
    }).catch(error => console.error(error))
  }


  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>Login</h2>
        <form>
          <input
            className='boxStyle'
            type="text"
            placeholder="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}/>
          <input
            className='boxStyle'
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}/>
            <br />
          <button className='LoginButton' type="button" onClick={handleLogin}>Login</button>
          <p id='keinKontoText'>Noch kein Konto? eröffne jetzt eines <a href='/Registration'>hier</a></p>
        </form>
        <button className='googleBtn' onClick={handleGoogleLogin}><i className="fab fa-google"></i> Google</button>
      </div>
    </div>
  );

};

