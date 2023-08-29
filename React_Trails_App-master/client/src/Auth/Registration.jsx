import React, { useEffect, useState } from 'react';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleAuthProvider, storage } from "./fire"
import { useNavigate } from 'react-router-dom';
import { useAuth } from './checkAuth';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc} from "firebase/firestore";
import { db } from "./fire" 
import { ScrollZoomHandler } from 'mapbox-gl';
import { getDownloadURL } from 'firebase/storage';
import { ref, uploadBytes } from 'firebase/storage';

const defaultPp = "https://firebasestorage.googleapis.com/v0/b/m248-projekt.appspot.com/o/DEFAULT_PROFILE_PICTURE_DEADPOOL_45x45.png?alt=media&token=665f04be-c2cd-4409-9f05-612be0eb7d0a&_gl=1*1k459ln*_ga*MzU4ODg1MDgxLjE2ODUxMDUwMzM.*_ga_CW55HF8NVT*MTY4NTcwNjI1My42LjEuMTY4NTcxMzUxNy4wLjAuMA.."

export default function Registration({ handleGoogleLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [PhotoUrl, setPhotoUrl] = useState(null);
  const navigate = useNavigate();
  const user = useAuth()

  useEffect(() => {
    try{
      if(user){
        navigate("/")
      }
    } catch(error){
      alert(error)
    }
  }, [user])
  

  async function handleRegistration() {
    createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
        await updateProfilePic(user)
        setTimeout(async () => {
          await addAdditionalRowsToUser(user.uid, "displayName", displayName, "photoURL", PhotoUrl ? PhotoUrl : defaultPp, "emailVerified", false)
        }, 1000)
        setTimeout(() => {
          location.reload()
          navigate("/")
        }, 500)
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    })
  };

  async function updateProfilePic(userCred){
    if (PhotoUrl !== null) {
      await updateProfile(userCred, { photoURL: PhotoUrl, displayName: displayName, emailVerified: false });
    } else{
      await updateProfile(userCred, { photoURL: defaultPp, displayName: displayName, emailVerified: false } )
    }
  }

  const addAdditionalRowsToUser = async (userId, fieldName, fieldValue, fieldName2, fieldValue2, fieldName3, fieldValue3) => {
    const updatedData = {
      [fieldName]: fieldValue,
      [fieldName2]: fieldValue2,
      [fieldName3]: fieldValue3,
    }
    try {
      const docRef = doc(collection(db, "users"), userId);
      return updateDoc(docRef, updatedData); 
    } catch (error) {
      console.error('Error adding additional row to the user document:', error);
    }
  };

  function openFileChooser(e) {
    e.preventDefault()
    const fileInput = document.getElementById('url');
    fileInput.click();
    setPhotoUrl(true)
  }


  function handleGoogleLogin(){
    signInWithPopup(auth, googleAuthProvider).then(result => {
      const credenetial = GoogleAuthProvider.credentialFromResult(result)
      const token = credenetial.accessToken;

      const user = result.user;
      console.log(user);
      setTimeout(() => {
        navigate("/")
      }, 500)
    }).catch(error => console.error(error))
  }



  async function handleFileSelection(e){
    e.preventDefault()
    const selectedFile = e.target.files[0]

    const storageRef = ref(storage, selectedFile.name)

    try{  
      const snapshot = await uploadBytes(storageRef, selectedFile)
      const url = await getDownloadURL(snapshot.ref)
      setPhotoUrl(url)
    } catch(error){
      console.log(error);
    }
    console.log(selectedFile);  
  }
  return (
    <>
    <div className="popup-overlay">
      <div className="popup">
        <h2>Register</h2>
        <form>
        <input
            className='boxStyle'
            type="text"
            placeholder="Username"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}/>
           <input type="file" name="url" id="url" onChange={handleFileSelection}/>
           <button className='btnStyle' onClick={openFileChooser}>Choose File</button>
          <input
            className='boxStyle'
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}/>
          <input
            className='boxStyle'
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}/>
            <br />
          <button className='RegistartionsButton' type="button" onClick={handleRegistration}>Register</button>
          <p id='keinKontoText'>Bereits ein konto? <a href="/Login">Log in</a></p>
        </form>
        <button className='googleBtn' onClick={handleGoogleLogin}><i className="fab fa-google"></i> Google</button>
      </div>
    </div>
    </>
  );
};
