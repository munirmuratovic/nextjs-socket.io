import React, { useState, useEffect, useRef } from "react";
import SocketIOClient from "socket.io-client";

// create random user
const user = "User_" + String(new Date().getTime()).substr(-3);

// component
const Index = () => {
  const inputRef = useRef(null);

  // connected flag
  const [connected, setConnected] = useState(false);

  // init chat and message
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // connect to socket server
    const socket = SocketIOClient.connect(process.env.BASE_URL, {
      path: "/api/socketio",
    });

    // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
      setConnected(true);
    });

    // update chat on new message dispatched
    socket.on("message", (message) => {
      chat.push(message);
      setChat([...chat]);
    });

    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  const sendMessage = async () => {
    if (msg) {
      // build message obj
      const message = {
        user,
        msg,
      };

      // dispatch message to other users
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      // reset field if OK
      if (resp.ok) setMsg("");
    }

    // focus after click
    inputRef?.current?.focus();
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="py-4 text-white  bg-blue-500 sticky top-0">
        <h1 className="text-center text-2xl font-semibold">Realtime Chat App</h1>
        <h2 className="mt-2 text-center">in Next.js and Socket.io</h2>
      </div>
      <div className="flex flex-col flex-1 bg-gray-200">
        <div className="flex-1 p-4 font-mono">
          {chat.length ? (
            chat.map((chat, i) => (
              <div key={"msg_" + i} className="mt-1">
                <span
                  className={chat.user === user ? "text-red-500" : "text-black"}
                >
                  {chat.user === user ? "Me" : chat.user}
                </span>
                : {chat.msg}
              </div>
            ))
          ) : (
            <div className="text-sm text-center text-gray-400 py-6">
              No chat messages
            </div>
          )}
        </div>
        <div className="bg-gray-400 p-4 h-20 sticky bottom-0">
          <div className="flex flex-row flex-1 h-full divide-gray-200 divide-x">
            <div className="pr-2 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={msg}
                placeholder={connected ? "Type a message..." : "Connecting..."}
                className="w-full h-full rounded-full shadow border-gray-400 border px-4"
                disabled={!connected}
                onChange={(e) => {
                  setMsg(e.target.value);
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
            </div>
            <div className="flex flex-col justify-center items-stretch pl-2">
              <button
                className="bg-blue-500 rounded-full shadow text-sm text-white h-full px-2"
                onClick={sendMessage}
                disabled={!connected}
              >
                SEND
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
