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

  // Initial setup - get media stream and establish socket connections
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

    return () => {
      socket.off("connect");
      socket.off("me");
      socket.off("calluser");
    };
  }, []);

  // Set up call ended event listener
  useEffect(() => {
    const handleCallEnded = () => {
      console.log("Call ended received: The other user ended the call");
      
      // Clear the video element
      if (userVideo.current) {
        userVideo.current.srcObject = null;
      }
      
      // Destroy the peer connection
      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null;
      }
      
      // Reset call state
      setCall({});
      setCallAccepted(false);
      setCallEnded(true);
      
      // Reset call ended after a delay
      setTimeout(() => {
        setCallEnded(false);
      }, 1000);
    };
    
    socket.on("callended", handleCallEnded);
    
    return () => {
      socket.off("callended", handleCallEnded);
    };
  }, []);

  // Ensure video ref is updated with stream
  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream, myVideo]);

  const answerCall = () => {
    if (!call.signal) {
      console.error("No incoming signal to answer the call!");
      return;
    }
    console.log("Answering call from:", call.from);
  
    setCallAccepted(true);
    setCallEnded(false);
    
    const peer = new Peer({ initiator: false, trickle: false, stream });
  
    peer.on("signal", (data) => {
      socket.emit("answercall", { signal: data, to: call.from, name });
    });
  
    peer.on("stream", (currentStream) => {
      console.log("Received remote stream");
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });
    
    // Handle peer close/destruction
    peer.on("close", () => {
      console.log("Peer connection closed");
      handlePeerDisconnect();
    });
    
    peer.on("error", (err) => {
      console.error("Peer error:", err);
      handlePeerDisconnect();
    });
  
    peer.signal(call.signal);
    connectionRef.current = peer;
  };
  
  const callUser = (id) => {
    console.log("Calling user with ID:", id);
    
    // Clean up any existing call state
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
    
    setCallEnded(false);
    
    const peer = new Peer({ initiator: true, trickle: false, stream });
  
    peer.on("signal", (data) => {
      socket.emit("calluser", { 
        userToCall: id, 
        signalData: data, 
        from: me, 
        name 
      });
    });
  
    peer.on("stream", (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });
    
    // Handle peer close/destruction
    peer.on("close", () => {
      console.log("Peer connection closed");
      handlePeerDisconnect();
    });
    
    peer.on("error", (err) => {
      console.error("Peer error:", err);
      handlePeerDisconnect();
    });
    
    // Remove any previous listener before adding a new one
    socket.off("callaccepted");
    
    socket.on("callaccepted", ({ signal, name: calleeName }) => {
      console.log("Call accepted by:", calleeName);
      setCallAccepted(true);
      setCallEnded(false);
      setCall((prev) => ({ ...prev, name: calleeName }));
      peer.signal(signal);
    });
  
    connectionRef.current = peer;
  };
  
  // Handle peer disconnect - similar to call ended but triggered by connection issues
  const handlePeerDisconnect = () => {
    console.log("Peer disconnected");
    
    // Clear video
    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }
    
    // Reset call state
    setCallAccepted(false);
    setCallEnded(true);
    setCall({});
    
    // Reset connection ref
    connectionRef.current = null;
    
    // Reset call ended state after delay
    setTimeout(() => {
      setCallEnded(false);
    }, 1000);
  };
  
  const leaveCall = () => {
    setCallEnded(true);
  
    // Notify other user that call is ending
    socket.emit("callended");
  
    // Destroy peer connection
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
  
    // Reset call state
    setCall({});
    setCallAccepted(false);
    
    // Clear remote video
    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }
    
    // Reset call ended state after delay to allow new calls
    setTimeout(() => {
      setCallEnded(false);
    }, 1000);
  };
  
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