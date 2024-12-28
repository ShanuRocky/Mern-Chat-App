import './App.css';
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import Login from './components/login';
import {useLayoutEffect, useState } from "react";
import React from 'react';
import Chat_page from "./components/chat_page";
import axios from 'axios';

function App() {

   axios.defaults.baseURL = "https://mern-chat-app-12.onrender.com";
   axios.defaults.withCredentials = true;

  const[user,check] = useState(false);

  

  useLayoutEffect(() =>
  {
    axios.get("/profile").then(response =>
    {
      // console.log(response.data);
        if(response.data !== "no token")
        {
           check( async (prev) => ({
            ...prev,
            user:  true
           }));
          // console.log(user);
        }else{
           console.log(response.data)
        }
    }
    )
    .catch(
      console.log("fock")
    );
      /*cleanup is used to remove any unwanted loops, intervals, listeners when the 
    component unmounts*/
    return () => console.log("clean up");
  },[]) //render on first first time render... 



  return (
   <>
     <BrowserRouter>
     <Routes>
     <Route path='/login' 
         element={(user) ? <Navigate to="/" /> : <Login />}></Route>
         <Route path='/'
         element={(user) ? <Chat_page /> : <Navigate to="/login" />}></Route>
     </Routes>
     </BrowserRouter>
   </>
  );
}

export default App;
