import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { mongoose} from "mongoose";
import Usermodel from "./models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import  {WebSocketServer } from 'ws'
import Message from "./models/messages.js";

dotenv.config(); //loads the .env file to process.env

mongoose.connect(process.env.MONGO_URL); // connecting server to our database..

const app = express();  //creating a new  express application used to define routes,middleware..

//app.use is used to register middleware function.
//the requests made by client will be in json format
//this middleware converts the json data into a javascript object.
app.use(express.json()); 

const saltrounds = 10 ;

// gets the cors request from localhost3000 made by the client side
app.use(
  cors({
    origin: "https://mern-chat-app-one-sooty.vercel.app/",
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // Cookies won't be sent with wildcard origins
  })
);


//When a request arrives at your server, it might contain cookies sent from the client (browser). 
//These cookies are typically stored in key-value pairs and used to maintain state information between the client and server.
//this middleware extracts the cookie data and attach it to req.cookies
//and now your route handlers can access it. 
app.use(cookieParser());

app.post("/login", async (req,res)=>
{
  //console.log(req.body);
  const {email,password} = req.body;
  const founder = await Usermodel.findOne({email});
       
  if(founder)
  {
    const check =  bcrypt.compareSync(password,founder.password);
      if(check)
      {
          jwt.sign({userId: founder._id,email: founder.email,name: founder.firstname +" " + founder.lastname},"wertgfxcewferettyjyuiumreereth", async (err,token) =>
          {
             if(err) throw err;
             //console.log("oKKKKKKKKKKK " + token);
             res.cookie("token",token,{sameSite: "none",secure: true}).json("success");
          });
          console.log("cookie generated")
      }else
      {
        return res.json("wrong password") ;
      }
  }else
  {
     return res.json("email not registerd");
  }
});

app.get("/profile",(req,res)  =>
{
  const token = req.cookies?.token;
  //console.log(token);
  if(token)
  {
    // console.log(token);
  jwt.verify(token,"wertgfxcewferettyjyuiumreereth",(err,userdata) =>
  {
     if(err) throw err;
    // console.log(userdata);
     res.json(userdata);
  });
  }else
  {
     res.json("no token");
  }
})

app.post("/signup", async (req,res) => 
{
  const { firstname, lastname, email, password, gender, phone, dateofbirth } = req.body;
  //console.log(req.body);

    bcrypt.hash(password,saltrounds,async (err,hash) =>
    {
      if(err)
      {
        console.log(err);
      }else
      {
        const user = await Usermodel.create({
        firstname : firstname,
        lastname : lastname,
        email : email,
        password : hash,
        gender : gender,
        phone : phone,
        dateofbirth : dateofbirth
      });
      //console.log(user);
      //console.log(hash);
      return res.json("success");
    }
    })
});

async function getuser(req)
{
  return new Promise((resolve,reject) =>
  {
    const token = req.cookies?.token;
     if(token)
     {
       jwt.verify(token,"wertgfxcewferettyjyuiumreereth",async (err,userdata) =>
     {
        if(err) throw err;
       // console.log(userdata);
        resolve(userdata.userId);
     });
     }else
     {
        reject("no tocken");
     }
  }) 
}

app.get("/peoples",async (req,res) =>
{
  const users = await Usermodel.find({},{_id:1,firstname:1,lastname:1});
 // console.log("hello users?????" + users);
  res.json(users);
})

app.get("/messages/:userId",async (req,res) =>
{
 // console.log(req.params);
   const userid = req.params.userId;
   const userdata = await getuser(req);
  // console.log("user:- " + userdata);
  const messagges = await Message.find({
    sender: {$in:[userid,userdata]},
    reciever: {$in:[userid,userdata]},
   }).sort({createdAt:1});
   res.json(messagges);
});

//starts littening to the port 8000 were the data is sent by the clint side.
const server = app.listen(8000, () =>
{
  console.log("running on port 8000");
});


//note cant use ws.WebSocketServer({server}) in ESM version 
//o check if you're using ESM, look for the presence 
//a type: "module" field in your package.json
//In the ESM module system, modules are imported using import statements.
//To create a WebSocket server, you need to import the WebSocketServer class:
const wss = new WebSocketServer({server});

wss.on("connection", (connection,req)=>
{
  function notifyonlinepeople()
  {
      // console.log([...wss.clients].map(c => c.username));
  [...wss.clients].forEach(client =>
    {
      client.send(JSON.stringify({
        online: [...wss.clients].map(c => ({userId:c.userId,username:c.username}))
    }))
    }
  )
  }

  // connection.isAlive = true;

  // connection.timer = setInterval(()=> {
  //   connection.ping();
  //   connection.deathTimer = setTimeout(()=>
  //   {
  //      connection.isAlive = false;
  //     // console.log("dead");
  //      connection.terminate();
  //      notifyonlinepeople();
  //   },2000);
  // },3000);

  // connection.on("pong",()=>
  // {
  //    clearTimeout(connection.deathTimer);
  // })

  console.log("connected");
  const cookies = req.headers.cookie;
  if(cookies)
  {
    const tokenstring = cookies.split(';').find(str => str.startsWith("token="));
    if(tokenstring)
    {
       const token = tokenstring.split('=')[1];
      jwt.verify(token,"wertgfxcewferettyjyuiumreereth",(err,userdata) =>
      {
         if(err) throw err;
         const username = userdata.name;
         const userId = userdata.userId;
         connection.userId = userId;
         connection.username = username;
      });
    }
  }

  connection.on('message',async (message) =>
  {
      const massage = JSON.parse(message);
      //console.log(massage);
      const {reciptent_id,sender_id,text} = massage.message;
     // console.log(reciptent_id);
      if(reciptent_id && text)
      {
          const messages = await Message.create(
          {
             reciever: reciptent_id,
             sender: sender_id,
             text: text
          }
         );
        // console.log(messages);
       //  console.log([...wss.clients].map(c => c.username));
        const recieve =  [...wss.clients].filter((c) => (c.userId === reciptent_id));
        recieve.forEach(c => c.send(JSON.stringify(massage.message)));
        console.log("sent");
      }
  });

  notifyonlinepeople();
  setInterval(() =>
  {
    notifyonlinepeople();
  },5000)

});

// wss.on("close",data =>
// {
//   console.log("disconnected",data);
// }
// )


// bVY2i2yKTYp2ZO7t
//ip - (152.58.188.242)
//connection string - mongodb+srv://1234kumarshanu9:bVY2i2yKTYp2ZO7t@cluster0.9xxbzua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjQ5MGMwMzMzODZmMmFhMGU1YjRmMzAiLCJpYXQiOjE3MTYyOTk2MTZ9.yLdGzM06JNK11BwCapQk57fQ9lg9maJyL7jttspCkTA