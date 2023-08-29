import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "./Auth/checkAuth"
import React, { useEffect, useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from "./Auth/fire";

export function Header({ getLanguage, signOutUser = null, t }){
    const navigate = useNavigate()  
    const user = useAuth()
    const [normalMode, setNormalMode] = useState(true)

    function toggleMode(){
      if(normalMode){
        const textElements = document.querySelectorAll("body *");
        textElements.forEach((element) => {
          element.style.color = "black";
        });

        const inputElements = document.querySelectorAll("input");
        inputElements.forEach((element) => {
          element.style.background = "white";
        });

        const buttonElements = document.querySelectorAll("button");
        buttonElements.forEach((element) => {
          element.style.background = "white";
        });

        const tables = document.querySelectorAll("table th");
        tables.forEach((element) => {
          element.style.background = "white";
        });

        const selects = document.querySelectorAll("select");
        selects.forEach(elem => {
          elem.style.background = "white"
          elem.style.border = "2px solid rgb(107, 215, 255)"
        })

        const options = document.querySelectorAll("option");
        options.forEach(elem => {
          elem.style.background = "white"
        })

        const dialogs = document.querySelectorAll("dialog");
        dialogs.forEach(elem => {
          elem.style.background = "white"
        })

        document.body.style.background = "white"
      }
    }

    function signOutUsr(){
        signOut(auth)
        localStorage.removeItem("authUser")
    }

    const handleChange = (event) => {
        getLanguage(event.target.value);
    };

    useEffect(() => {
        document.getElementById("pp").src = user.photoURL;
    }, [user])

    const openPopup = () => {
        const dialog = document.getElementById('account-dialog');
        dialog.showModal();
      };
    
      const closePopup = () => {
        const dialog = document.getElementById('account-dialog');
        dialog.close();
      };

    return(
        <header>
            <nav>   
                <ul>
                    <div>
                        <div><Link to="/"><button className="btnStyle">{t["home"]}</button></Link></div>
                        <div className="languages"> 
                            <select className="language" value={localStorage.getItem("LANG")} onChange={handleChange}>
                            <option value="de">German</option>
                            <option value="en">English</option>
                            <option value="sq">Albanian</option>
                            <option value="fr">French</option>
                            <option value="ar">Arabic</option>
                            </select>
                        </div>
                        {!user ? 
                            <div className="loginTools">
                                <li><button className="btnStyle" onClick={() => navigate("/Login")}>Login</button></li>
                                <li><button className="btnStyle" onClick={() => navigate("/Registration")}>Register</button></li>
                            </div>
                            :
                            <div className="loginTools">
                                <img onClick={openPopup} src="" className="profilePic" id="pp"/>
                              <dialog id="account-dialog">
                                {user ? (
                                  <>
                                    <h2>{t["account"]}</h2>
                                    <p><img src={user.photoURL} className="profilePic" id="pp"/> {user.displayName} </p>
                                    <p>{user.email}</p>
                                    
                                    <button onClick={closePopup} className="btn btn-dark btn-outline-danger">{t["close"]}</button>
                                  </>
                                ) : (
                                  <p>Loading...</p>
                                )}
                              </dialog>
                                <li><button className="btnStyle" onClick={() => signOutUser ? signOutUser() : signOutUsr()}>{t["signOut"]}</button></li>
                                {/* <li><button className="btnStyle" onClick={toggleMode}>Toggle Mode</button></li> */}
                            </div>
                        }
                    </div>
                </ul>
            </nav>
        </header>
    )
}