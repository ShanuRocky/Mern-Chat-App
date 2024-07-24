import { useEffect, useState } from "react";
import React from "react";
import axios from "axios";

function Chat_page() {
  const [user, userfun] = useState({
    name: "",
    email: "",
    id: "",
  });

  const [ws, setws] = useState(null);
  const [onlinepeople, setonlinepeople] = useState({});
  const [offlinepeople, setofflinepeople] = useState({});
  const [selected, setselleted] = useState(null);
  const [messag, setmessag] = useState("");
  const [person_message, setperson_message] = useState({});

  async function showonlineonlinepeople(peple) {
    const onlinepeoples = {};
    peple.forEach((person) => {
      onlinepeoples[person.userId] = person.username;
    });
    setonlinepeople(onlinepeoples);
  }

  function handlemessage(ev) {
    const messagedata = JSON.parse(ev.data);

    if ("online" in messagedata) {
      //    console.log(Array.isArray(messagedata.online))
      showonlineonlinepeople(messagedata.online);
    } else {
      if (messagedata.sender_id !== messagedata.reciptent_id) {
        setperson_message((prev) => {
          const obj = { ...prev };
          const newonbj = {
            type: "recieve",
            text: messagedata.text,
            sender: messagedata.sender_id,
          };
          if (messagedata.reciptent_id in obj) {
            obj[messagedata.reciptent_id].push(newonbj);
          } else {
            obj[messagedata.reciptent_id] = [newonbj];
          }
         // console.log(messagedata);
          return obj;
        });
      }
    }
  }
  useEffect(() => {
    axios
      .get("/profile")
      .then(async (user) => {
        // console.log("hello " + user.data.name);
        userfun({
          name: user.data.name,
          email: user.data.email,
          id: user.data.userId,
        });
      })
      .catch(console.log("catch"));

    const ws = new WebSocket("ws://localhost:8000");
    setws(ws);
    ws.addEventListener("message", handlemessage);
    //ws.close("ws://localhost:8000",)
  }, []);

  useEffect(() => {
    const element = document.getElementById("scrollable-element");
    if (element) {
      element.scrollTop = element.scrollHeight;
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, [selected,person_message]);

  //problem///////////
  useEffect(() => {
    axios.get("/peoples").then((peoples) => {
      const offlinepeoples = {};
      peoples.data.forEach((pep) => {
        if (!(pep._id in onlinepeople)) {
          offlinepeoples[pep._id] = pep.firstname + " " + pep.lastname;
        }
      });
      setofflinepeople(offlinepeoples);
      console.log(offlinepeople);
    });
  }, [onlinepeople]);

  
  useEffect(() => {
    if (selected !== null) {
      axios.get("/messages/" + selected).then((messages) => {
        console.log(messages.data);

        setperson_message((prev) => {
          const obj = {};
          Object.keys(messages.data).map((c) => {
            console.log(c);
            if (messages.data[c].sender === user.id) {
              //put in message sended
              const newonbj = {
                type: "send",
                text: messages.data[c].text,
                reciever: messages.data[c].reciever,
              };
              if (messages.data[c].sender in obj) {
                obj[messages.data[c].sender].push(newonbj);
              } else {
                obj[messages.data[c].sender] = [newonbj];
              }
            } else {
              //put in message recieved
              const newonbj = {
                type: "recieve",
                text: messages.data[c].text,
                sender: messages.data[c].sender,
              };
              if (messages.data[c].reciever in obj) {
                obj[messages.data[c].reciever].push(newonbj);
              } else {
                obj[messages.data[c].reciever] = [newonbj];
              }
            }
            return "";
          });
          return obj;
        });
      });
    }
  }, [selected, user]);

  function selectone(userId) 
  {
    setselleted(userId);
  }

  function typing(event) 
  {
    setmessag(event.target.value);
  }

  function sendmessage(ev) {
    ev.preventDefault();
    if (messag !== "") {
      //  console.log(messag);
      ws.send(
        JSON.stringify({
          message: {
            reciptent_id: selected,
            sender_id: user.id,
            text: messag,
          },
        })
      );
      //  console.log(messag);
      setperson_message((prev) => {
        const obj = { ...prev };
        console.log("//1//");
        const messge = {
          type: "send",
          text: messag,
          reciever: selected,
        };
        if (user.id in obj) {
          obj[user.id].push(messge);
        } else {
          obj[user.id] = [messge];
        }
        console.log(obj);
        return obj;
      });
      console.log("())");
      setmessag("");
    }
  }

  return (
    <div className="box row">
      <div className="col-md-3 col-sm-3 text-center">
        <h4 className="mt-2">contacts</h4>
        <div className="contacts mt-md-3 mt-sm-2 border display-block">
          <div>
            {Object.keys(onlinepeople).map((userId) => (
              <div
                onClick={() => selectone(userId)}
                className={
                  "person online m-2 p-1 " + (userId === selected ? "selected" : "")
                }
              >
                {onlinepeople[userId]}
              </div>
            ))}
          </div>
          <div>
            { 
            Object.keys(offlinepeople).map((peoppleid) => (
              <div
                onClick={() => selectone(peoppleid)}
                className={
                  "person offline m-2 p-1 " + (peoppleid === selected ? "selected" : "")
                }
              >
               {offlinepeople[peoppleid]}
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 ">
          <div className="m-1 border">user:- {user.name}</div>
          <div className="border btn btn-success mt-0 mb-2 w-100 py-2">
            Log out
          </div>
        </div>
      </div>
      <div className="col-md-9 col-sm-9  border">
        {!selected && <div className="blank text-center">SELECT USER TO CHAT</div>}
        {selected && (
          <>
            <div className="border mt-1 display-flex text-center">
              Chat With {(selected in onlinepeople) ? onlinepeople[selected] : offlinepeople[selected]}
            </div>
            <div id="scrollable-element" className="p-2 chating  border mt-1">
              {Object.keys(person_message).map((userid) => {
                // console.log(person_message);
                if (userid === user.id) {
                  return (
                    <div>
                      {person_message[userid].map((c) => {
                        return c.reciever === selected && c.type === "send" ? (
                          <div className="right">
                            <div className="send p-1">{c.text}</div>
                          </div>
                        ) : c.sender === selected && c.type === "recieve" ? (
                          <div className="left">
                            <p className="recieve">{c.text}</p>
                          </div>
                        ) : (
                          <div></div>
                        );
                      })}
                    </div>
                  );
                }
              })}
            </div>
            <div className="m-0 d-flex flex-direction-row row text-center mt-5">
              <form onSubmit={sendmessage} className="row">
                <div className="col-md-11 col-sm-10 p-1 m-0">
                  <input
                    onChange={typing}
                    type="string"
                    value={messag}
                    className="form-control form-control-lg "
                    placeholder="Type your message here"
                  />
                </div>
                <div className="col-md-1 col-sm-2 m-0">
                  <div onClick={sendmessage} className=" btn my-btn">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="50"
                      height="36"
                      fill="currentColor"
                      className="bi  mb-0 pb-0 bi-box-arrow-up"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 14 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5h2a.5.5 0 0 1 0 1z"
                      />
                      <path
                        fill-rule="evenodd"
                        d="M7.646.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 1.707V10.5a.5.5 0 0 1-1 0V1.707L5.354 3.854a.5.5 0 1 1-.708-.708z"
                      />
                    </svg>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat_page;
