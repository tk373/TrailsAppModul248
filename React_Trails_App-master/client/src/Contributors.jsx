import React, { useEffect, useState } from 'react'
import { useAuth } from './Auth/checkAuth'
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from './Auth/fire'
import { updateProfile } from 'firebase/auth'
import Dialog from './Dialog'

export default function Contributors({ trail, t }) {
  const authUser = useAuth()
  const [searchInput, setSearchInput] = useState("")
  const [users, setUsers] = useState([])
  const [searchedUsers, setSearchedUsers] = useState([])
  const [creator, setCreator] = useState({})
  const [displayDialog, setDisplayDialog] = useState([false, ""])

  //TODO: allow only the creator to make changes.

  async function searchForUsers(e){
    e.preventDefault()
    try{
      const snapshotOne = await getDocs(
        query(collection(db, "users"), where("email", "!=", null))
      );

      const data = snapshotOne.docs.map(doc => doc.data())
      const filtered = data.filter(user => user.displayName.includes(searchInput))
      setSearchedUsers(filtered)
    } catch(error){
      console.error(error)
    }
  }

  async function addContributor(user) {
    if(creator.uid !== authUser.uid){
      setDisplayDialog([true, "Only the owner can modify this trail."])
      return;
    }
    const newContributors = users.map(obj => obj.uid)
    if(newContributors.includes(user.uid)){
      setDisplayDialog([true, "Contributor already exists"])
      return;
    }

    const addedContributors = [...newContributors, user.uid]
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "trails"), where("rid", "==", trail.rid))
      );
      querySnapshot.forEach((doc) => {
        updateDoc(doc.ref, {
          contributors: addedContributors
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function removeContributor(user) {
    if(creator.uid !== authUser.uid){
      setDisplayDialog([true, "Only the owner can modify this trail."])
      return;
    }
    const newContributors = users.filter(current => current.uid !== user.uid);
    const activeContributors = newContributors.map(obj => obj.uid)
  
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "trails"), where("rid", "==", trail.rid))
      );
      querySnapshot.forEach((doc) => {
        updateDoc(doc.ref, {
          contributors: activeContributors
        });
      });
    } catch (error) {
      console.error(error);
    }

    setUsers(newContributors)
  }
  

  async function loadContributors(){
    const trailSnap = await getDocs(
      query(collection(db, "trails"), where("rid", "==",  trail.rid))
    )
    const newTrail = trailSnap.docs.map(doc => doc.data())
    console.log("trails", newTrail);

    const snapshot = await getDocs(
      query(collection(db, "users"), where("uid", "in",  newTrail[0].contributors))
    )

    const data = snapshot.docs.map(doc => doc.data())
    console.log("loading", data);
    if(data){
      setUsers(data)
    }
  }

  async function evaluateContributor(user){
    await addContributor(user)
    await loadContributors()
  }

  useEffect(() => {
    async function loadSyncContributors(){
      await loadContributors()
    }

    async function loadCreator(){
      try{
        const snapshotOne = await getDocs(
          query(collection(db, "users"), where("uid", "==", trail.creator[1]))
        );
        const data = snapshotOne.docs.map(doc => doc.data())
        const creator = data[0]
        setCreator(creator)
  
      } catch(error){
        console.log(error);
      }
    }

    loadCreator()
    loadSyncContributors()
  }, [])

  return (
    <div className='contributors'>
      {displayDialog[0] && <Dialog closeAlert={() => setDisplayDialog([false, []])} message={displayDialog[1]}/>}

      <div className='cform'>
        <label htmlFor="users">{t["email"]}</label>
        <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} type="text" className='boxStyle' name='users'/>
        <button className='btn btn-primary' onClick={searchForUsers}>{t["search"]}</button>
      </div>
      <div className='clist'>
        <h2>{t["searchedContributors"]}</h2>
        <table className='styled-table search-table'>
          <thead>
            <tr>
              <th></th>
              <th>{t["username"]}</th>
              <th>{t["email"]}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {searchedUsers && searchedUsers.map((user, index) => {
              return (
                <>
                  <tr key={user.email}>
                    <td><img src={user.photoURL}/></td>
                    <td>{user.displayName}</td>
                    <td>{user.email}</td>
                    <td><button className='btn btn-primary' onClick={() => evaluateContributor(user)}>Add</button></td>
                  </tr>
                </>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className='clist2'>
        <h2>{t["activeContributors"]}</h2>
        <table className='styled-table search-table'>
          <thead>
            <tr>
              <th></th>
              <th>{t["username"]}</th>
              <th>{t["email"]}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users && users.map((user, index) => {
              return (
                <>
                  <tr key={user.email}>
                    <td><img src={user.photoURL}/></td>
                    <td>{user.displayName}</td>
                    <td>{user.email}</td>
                    <td><button className='btn btn-dark btn-outline-danger' onClick={() => removeContributor(user)}>{t["delete"]}</button></td>
                  </tr>
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

