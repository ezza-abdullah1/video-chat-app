import React, { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const SocketContext = createContext();
const socket = io("http://localhost:5000", { transports: ["websocket"] });

const ContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [me, setMe] = useState("");
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    socket.on("connect", () => {
      console.log("Connected to server. My socket ID:", socket.id);
    });

    socket.on("me", (id) => {
      console.log("My ID received from server:", id);
      setMe(id);
    });

    socket.on("calluser", ({ from, name: callerName, signal }) => {
      console.log("Incoming call from:", from);
      setCall({ isReceivedCall: true, from, name: callerName, signal });
    });
    socket.on("callended", () => {
        console.log("The other user ended the call.");
    
        setCall({});
        setCallAccepted(false);
        setCallEnded(true);
    
        if (userVideo.current) {
          userVideo.current.srcObject = null; // Clear the video container
        }
    
        if (connectionRef.current) {
          connectionRef.current.destroy();
        }
      });

    return () => {
      socket.off("connect");
      socket.off("me");
      socket.off("calluser");
      socket.off("callended");
    };
  }, []);

  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  const answerCall = () => {
    if (!call.signal) {
      console.error("No incoming signal to answer the call!");
      return;
    }
    console.log("Answering call from:", call.from);
  
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });
  
    peer.on("signal", (data) => {
      console.log("Sending answer signal:", data);
      socket.emit("answercall", { signal: data, to: call.from, name }); // Send correct callee name
    });
  
    peer.on("stream", (currentStream) => {
      console.log("Receiving remote stream");
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });
  
    peer.signal(call.signal); // Apply the caller’s signal
    connectionRef.current = peer;
  };
  
  const callUser = (id) => {
    console.log("Calling user with ID:", id);
  
    const peer = new Peer({ initiator: true, trickle: false, stream });
  
    peer.on("signal", (data) => {
      if (!data) {
        console.error("Signal data is undefined! Peer may not be initialized correctly.");
        return;
      }
      console.log("Emitting calluser event with signal data:", data);
      socket.emit("calluser", { userToCall: id, signalData: data, from: me, name }); // Send caller's name
    });
  
    peer.on("stream", (currentStream) => {
      console.log("Receiving remote stream");
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });
  
    // Receive call accepted event with correct callee name
    socket.on("callaccepted", ({ signal, name: calleeName }) => {
      console.log("Call accepted by:", calleeName); // Debugging log
      setCallAccepted(true);
      setCall((prev) => ({ ...prev, name: calleeName })); // Update callee name
      peer.signal(signal);
    });
  
    connectionRef.current = peer;
  };
  

  const leaveCall = () => {
    setCallEnded(true);
  
    // Emit event to notify the other user
    socket.emit("callended");
  
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
  
    // Reset state and clear video containers
    setCall({});
    setCallAccepted(false);
    setStream(null);
  
    if (userVideo.current) {
      userVideo.current.srcObject = null; // Remove video feed from UI
    }
  
    window.location.reload();
  };
  
  useEffect(() => {
    // Handle when another user hangs up
    socket.on("callended", () => {
      console.log("The other user ended the call.");
  
      setCall({});
      setCallAccepted(false);
      setCallEnded(true);
  
      if (userVideo.current) {
        userVideo.current.srcObject = null; // Clear the video container
      }
  
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
    });
  
    return () => {
      socket.off("callended");
    };
  }, []);
  
  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
