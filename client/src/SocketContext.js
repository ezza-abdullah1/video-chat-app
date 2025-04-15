import React, { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const SocketContext = createContext();
const socket = io("http://localhost:5000", { transports: ["websocket"] });

const ContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [me, setMe] = useState("");
  const [peers, setPeers] = useState([]); // List of { peerID, peer, name }
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("default-room");

  const myVideo = useRef();
  const peersRef = useRef([]);
  // Ref used to guard against duplicate join attempts
  const joinedRef = useRef(false);

  // Get user media and set the local stream
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
        // Removed joinRoom call here to avoid duplicate joins.
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [name]);

  // Set up our own socket id
  useEffect(() => {
    socket.on("me", (id) => setMe(id));
    return () => {
      socket.off("me");
    };
  }, []);

  // Helper function to clean up all peer connections
  const cleanupConnections = () => {
    peersRef.current.forEach(({ peer }) => {
      if (peer) {
        peer.destroy();
      }
    });
    peersRef.current = [];
    setPeers([]);
  };

  // Join the meeting room (only emit join event if not already joined)
  const joinRoom = () => {
    // Guard: don't join twice
    if (joinedRef.current) return;
    joinedRef.current = true;

    cleanupConnections();

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-room", { roomId, name });
  };

  // Register socket event listeners once when stream and name are available
  useEffect(() => {
    if (!stream || !name) return;

    // Listener for receiving the list of all users in the room (for initiator)
    const handleAllUsers = (users) => {
      console.log("Received all users:", users);
      const peersFromUsers = [];
      users.forEach((user) => {
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream,
        });
        peer.on("signal", (signal) => {
          socket.emit("sending-signal", {
            userToSignal: user.id,
            signal,
            callerId: socket.id,
            callerName: name,
          });
        });
        peersRef.current.push({ peerID: user.id, peer, name: user.name });
        peersFromUsers.push({ peerID: user.id, peer, name: user.name });
      });
      setPeers(peersFromUsers);
    };

    socket.on("all-users", handleAllUsers);

    // Listener for new users connecting (for non-initiators)
    const handleUserConnected = (payload) => {
      console.log("User connected:", payload.callerId);
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });
      peer.on("signal", (signal) => {
        socket.emit("returning-signal", { signal, callerId: payload.callerId });
      });
      peersRef.current.push({ peerID: payload.callerId, peer, name: payload.callerName });
      setPeers((prev) => [
        ...prev,
        { peerID: payload.callerId, peer, name: payload.callerName },
      ]);
    };

    socket.on("user-connected", handleUserConnected);

    // Listener for initiator receiving a signal from a non-initiator
    const handleUserJoined = (payload) => {
      console.log("Received signal from user:", payload.callerId);
      const item = peersRef.current.find((p) => p.peerID === payload.callerId);
      if (item) {
        try {
          item.peer.signal(payload.signal);
        } catch (err) {
          console.error("Error during peer.signal (user-joined):", err);
        }
      }
    };

    socket.on("user-joined", handleUserJoined);

    // Listener for receiving returned signal (for non-initiators)
    const handleReceivingReturnedSignal = (payload) => {
      console.log("Received returned signal from:", payload.id);
      const item = peersRef.current.find((p) => p.peerID === payload.id);
      if (item) {
        try {
          item.peer.signal(payload.signal);
        } catch (err) {
          console.error("Error during peer.signal (receiving-returned-signal):", err);
        }
      }
    };

    socket.on("receiving-returned-signal", handleReceivingReturnedSignal);

    // Cleanup these listeners when the component unmounts or when stream/name change
    return () => {
      socket.off("all-users", handleAllUsers);
      socket.off("user-connected", handleUserConnected);
      socket.off("user-joined", handleUserJoined);
      socket.off("receiving-returned-signal", handleReceivingReturnedSignal);
    };
  }, [stream, name]);

  // Listen for "user-disconnected" events and remove the peer from the UI
  useEffect(() => {
    const handleUserDisconnected = (id) => {
      console.log("User disconnected with ID:", id);
      const peerObj = peersRef.current.find((p) => p.peerID === id);
      if (peerObj && peerObj.peer) {
        peerObj.peer.destroy();
      }
      peersRef.current = peersRef.current.filter((p) => p.peerID !== id);
      setPeers((prev) => prev.filter((p) => p.peerID !== id));
    };

    socket.on("user-disconnected", handleUserDisconnected);
    return () => {
      socket.off("user-disconnected", handleUserDisconnected);
    };
  }, []);

  // Auto-join room if name and stream are available (only once thanks to joinedRef)
  useEffect(() => {
    if (name && stream) {
      joinRoom();
    }
  }, [name, stream]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      cleanupConnections();
      socket.off("all-users");
      socket.off("user-connected");
      socket.off("user-joined");
      socket.off("receiving-returned-signal");
      socket.off("user-disconnected");
      socket.disconnect();
    };
  }, []);

  // Updated leaveRoom function
  const leaveRoom = () => {
    console.log("Leaving room, cleaning up connections...");
    socket.emit("leave-room");
    cleanupConnections();
    if (socket.connected) {
      socket.disconnect();
    }
    setName("");
    // Reset join flag so that user can join a new room later if needed
    joinedRef.current = false;
  };

  return (
    <SocketContext.Provider
      value={{
        me,
        stream,
        myVideo,
        peers,
        name,
        setName,
        roomId,
        setRoomId,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
