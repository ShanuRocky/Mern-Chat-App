import { useState } from "react";
import React from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";



function Login() 
{
    const navigate = useNavigate();   //use to navigate through different pages

    const[pop,popfun] = useState(false);  //used to switch from signup to login or login to signup within a single page

    const[signup,signupfunc] = useState({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      gender: "male",
      phone: "",
      dateofbirth: ""
  })

    const[login,loginfunc] = useState({
      email: "",
      password: ""
    });

    //function to check whether all field are entered by the user or not.
    function isEmpty(obj)
    {
        for (const key in obj) 
        {
          if (obj[key] == "") 
          {
            return false; // Not empty if any property has a value
          }
        }
        return true; // Empty if all properties are empty strings or undefined
      }

      //handles input given by the user in login
      const handlechangelogin = (event) =>
        {
          //This is also a method
          // loginfunc((prev) => {
          //   const newState = { ...prev };
          //   newState[event.target.name] = event.target.value;
          //   return newState;
          // })

          // Object Destructuring and Spread Operator (Recommended):
          //This method is concise, readable, and promotes immutability by creating a new object
            loginfunc((prev) => 
            ({
                ...prev,
                [event.target.name]: event.target.value
            })
            )
        }
      
    //handles input given by the user in signup
    const handlechange = (event) =>
    {
        signupfunc((prev) => 
        ({
            ...prev,
            [event.target.name]: event.target.value
        })
        )
    }

    //submitting the form filled by the user to the server.. and getting response of either
    //failure or success in registring the client to database.. 
    const submit = (event) =>
    {
        event.preventDefault();   //prevents default action of the form.
        var valid = isEmpty(signup); 
        if(valid === false)
        {
          alert(valid);
        }else
        {
        axios.post("http://localhost:8000/signup",signup) //sending post request to the server.
        .then((res) =>
        {
            if(res.data === "success")
            {
                popfun(!pop);
            }else
            {
                alert("failed to register..");
            }
        })
        .catch((err) =>
        {
            alert("error");
        })
      }
    }

    //fuction to reload the page.
    function refreshPage()
    { 
        window.location.reload(); 
    }

    //submitting the login details to server in response 
    //getting success if it finds in the database and
    //moves on the main page of the application.
    const loginme = (event) =>
    {
        event.preventDefault();
        var valid = isEmpty(login); 
        if(valid === false)
        {
          alert("please fill the required fields");
        }else
        {
        axios.post("http://localhost:8000/login",login)  //sending post request to the server.
        .then((res) =>
        {
          if(res.data === "success")
          {
            navigate("/");
            refreshPage();  // refresh is required to move to main page...
          }else
          {
             alert(res.data);
          }
        })
        .catch((err) =>
        {
            alert("error");
        })
      }
    }

    const sign = () =>
    {
        popfun(!pop);
    };

  return (
    <>
    { pop &&
    (
        <div className="containerr">
        <form className="row g-3 ">
        <div className="col-md-6">
            <label htmlFor ="inputfirstname" className="form-label">
              First name
            </label>
            <input defaultValue={signup.firstname} onChange={handlechange} name="firstname" type="string" className="form-control" id="inputfirstname" required/>
          </div>
          <div className="col-md-6">
            <label htmlFor="inputlastname" className="form-label">
              Last name
            </label>
            <input defaultValue={signup.lastname} onChange={handlechange} name="lastname" type="string" className="form-control" id="inputlastname" required/>
          </div>
          <div className="col-md-6">
            <label htmlFor="inputEmail4" className="form-label">
              Email
            </label>
            <input defaultValue={signup.email} onChange={handlechange} name="email" type="email" className="form-control" id="inputEmail4" required />
          </div>
          <div className="col-md-6">
            <label htmlFor="inputPassword4" className="form-label">
              Password
            </label>
            <input defaultValue={signup.password} onChange={handlechange} name="password" type="password" className="form-control" id="inputPassword4" required/>
          </div>
          <div className="col-12">
            <label htmlFor="inputphone" className="form-label">
              Phone no.
            </label>
            <input
            defaultValue={signup.phone}
            name="phone"
            onChange={handlechange}
              type="string"
              className="form-control"
              id="inputphone"
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="dateofbirth" className="form-label">
              Birthdate
            </label>
            <input defaultValue={signup.dateofbirth} onChange={handlechange} name="dateofbirth" type="date" className="form-control" id="birthdate" required/>
          </div>
          <div className="col-md-6">
            <label htmlFor="gender" className="form-label">
              Gender
            </label>
            <select defaultValue={signup.gender} onChange={handlechange} name="gender" id="genter" className="form-select">
              <option >Male</option>
              <option>Female</option>
              required
            </select>
          </div>
          <div className="col-6" >
            <button  onClick={submit} className="btn btn-primary">
              Create Account
            </button>
            </div>
            <div className="col-6">
            <button onClick={sign}
            className="btn btn-primary"> Go to Sign In</button>
            </div>
        </form>
        </div>
    )
    }
    { (!pop) &&
    <div className="container   pt-5">
<main className="form-signin w-100 m-auto">
  <form  className="m-4 p-5">
    <h1 className="h3 mb-3 mt-5 fw-normal">Please sign in</h1>

    <div className="form-floating ">
      <input defaultValue={login.email} onChange={handlechangelogin} name="email" type="email" className="form-control mb-1" id="floatingInput" placeholder="name@example.com" required />
      <label htmlFor="floatingInput">Email address</label>
    </div>
    <div className="form-floating">
      <input defaultValue={login.password} onChange={handlechangelogin} name="password" type="password" className="form-control " id="floatingPassword" placeholder="Password" required/>
      <label htmlFor="floatingPassword">Password</label>
    </div>

    <div className="form-check string-start my-3">
      <input className="form-check-input" type="checkbox" value="remember-me" id="flexCheckDefault" />
      <label className="form-check-label" htmlFor="flexCheckDefault">
        Remember me
      </label>
    </div>
    <button onClick={loginme} className="btn btn-primary w-100 py-2 mb-2">Sign in</button>
    <a className="forgot" href="./forgotpass"> Forgotten password </a>
    <div className="container justify-items-center w-50">
    <div onClick={sign}
    className="btn btn-success mt-3 w-100  py-2">Create account</div>
    </div>
  </form>
</main>
</div>
}
    </>
  );
}

export default Login;
