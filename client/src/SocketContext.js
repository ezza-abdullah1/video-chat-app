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
  const [roomId, setRoomId] = useState("default-room"); // default room (can be modified)

  const myVideo = useRef();
  const peersRef = useRef([]);

  // Get user media. Once the user’s name is set, join the room.
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
        // If the user has already provided a name, join room
        if (name) {
          joinRoom();
        }
      })
      .catch((error) => console.error("Error accessing media devices:", error));
  }, [name]);

  useEffect(() => {
    // Save our own socket id
    socket.on("me", (id) => setMe(id));
    return () => {
      socket.off("me");
    };
  }, []);

  // Join the meeting room once a name is provided
  const joinRoom = () => {
    socket.emit("join-room", { roomId, name });

    socket.on("all-users", (users) => {
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
    });

    // When another user joins and sends their signal
    socket.on("user-connected", (payload) => {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });
      peer.on("signal", (signal) => {
        socket.emit("returning-signal", { signal, callerId: payload.callerId });
      });
      peersRef.current.push({ peerID: payload.callerId, peer, name: payload.callerName });
      setPeers((users) => [...users, { peerID: payload.callerId, peer, name: payload.callerName }]);
    });

    // Signal from an initiator for this new user (receiver handling)
    socket.on("user-joined", (payload) => {
      const item = peersRef.current.find((p) => p.peerID === payload.callerId);
      if (item) {
        item.peer.signal(payload.signal);
      }
    });

    // When a receiver returns a signal to an initiator
    socket.on("receiving-returned-signal", (payload) => {
      const item = peersRef.current.find((p) => p.peerID === payload.id);
      if (item) {
        item.peer.signal(payload.signal);
      }
    });

    // When a user disconnects, remove their peer
    socket.on("user-disconnected", (id) => {
      const peerObj = peersRef.current.find((p) => p.peerID === id);
      if (peerObj) {
        peerObj.peer.destroy();
      }
      peersRef.current = peersRef.current.filter((p) => p.peerID !== id);
      setPeers((users) => users.filter((p) => p.peerID !== id));
    });
  };

  // Leave the meeting and clean up connections
  const leaveRoom = () => {
    peersRef.current.forEach((p) => p.peer.destroy());
    peersRef.current = [];
    setPeers([]);
    socket.disconnect();
    window.location.reload();
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
