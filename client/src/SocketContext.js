import React, { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const SocketContext = createContext();
const socket = io(process.env.REACT_APP_SERVER_URL || "http://localhost:5000", { 
  transports: ["websocket", "polling"] 
});

const ContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [me, setMe] = useState("");
  const [peers, setPeers] = useState([]); // List of { peerID, peer, name, stream }
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [chatMessages, setChatMessages] = useState([]); // Chat messages state

  const myVideo = useRef();
  const peersRef = useRef([]);
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

  // Function to update all peer connections with new stream
  const updatePeerStreams = (newStream) => {
    peersRef.current.forEach(({ peer }) => {
      if (peer && peer.streams && peer.streams.length > 0) {
        // Remove old stream
        peer.streams[0].getTracks().forEach(track => {
          peer.removeTrack(track, peer.streams[0]);
        });
        
        // Add new stream tracks
        newStream.getTracks().forEach(track => {
          peer.addTrack(track, newStream);
        });
      }
    });
  };

  // Join the meeting room (only emit join event if not already joined)
  const joinRoom = () => {
    if (joinedRef.current) return;
    joinedRef.current = true;

    cleanupConnections();

    if (!socket.connected) {
      socket.connect();
    }

    console.log(`Joining room: ${roomId} as ${name}`);
    socket.emit("join-room", { roomId, name });
  };

  // Register socket event listeners once when stream and name are available
  useEffect(() => {
    if (!stream || !name) return;

    /**
     * Helper function to create and configure a Simple-Peer instance.
     */
    const createPeer = (userToSignal, initiator, localStream, initialName) => {
      const peer = new Peer({
        initiator,
        trickle: false,
        stream: localStream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
            {
              urls: "turn:openrelay.metered.ca:80",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
          ],
        },
      });

      peer.on("signal", (signal) => {
        socket.emit("sending-signal", {
          userToSignal: userToSignal,
          signal,
          callerId: socket.id,
          callerName: name,
        });
      });

      // Update the 'peers' state with the remote stream
      peer.on("stream", (remoteStream) => {
        console.log(`Received remote stream from ${userToSignal}`);
        setPeers((prevPeers) => {
          const existingPeerIndex = prevPeers.findIndex(
            (p) => p.peerID === userToSignal
          );
          if (existingPeerIndex > -1) {
            const updatedPeers = [...prevPeers];
            updatedPeers[existingPeerIndex] = {
              ...updatedPeers[existingPeerIndex],
              stream: remoteStream,
            };
            return updatedPeers;
          } else {
            return [
              ...prevPeers,
              { peerID: userToSignal, peer, name: initialName, stream: remoteStream },
            ];
          }
        });
      });

      peer.on("close", () => {
        console.log("Peer connection closed for:", userToSignal);
        setPeers((prev) => prev.filter((p) => p.peerID !== userToSignal));
        peersRef.current = peersRef.current.filter((p) => p.peerID !== userToSignal);
      });

      peer.on("error", (err) => {
        console.error("Peer error with", userToSignal, ":", err);
      });

      return peer;
    };

    // Listener for receiving the list of all users in the room (for initiator)
    const handleAllUsers = (users) => {
      console.log("Received all users:", users);
      const peersFromUsers = [];
      users.forEach((user) => {
        const peer = createPeer(user.id, true, stream, user.name);
        peersRef.current.push({ peerID: user.id, peer, name: user.name, stream: null });
        peersFromUsers.push({ peerID: user.id, peer, name: user.name, stream: null });
      });
      setPeers(peersFromUsers);
    };

    socket.on("all-users", handleAllUsers);

    // Listener for new users connecting (for non-initiators)
    const handleUserConnected = (payload) => {
      console.log("User connected:", payload.callerId);
      const peer = createPeer(payload.callerId, false, stream, payload.callerName);
      peersRef.current.push({ peerID: payload.callerId, peer, name: payload.callerName, stream: null });
      setPeers((prev) => [
        ...prev,
        { peerID: payload.callerId, peer, name: payload.callerName, stream: null },
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

    // Listen for track state changes from other users
    const handleTrackStateChange = (payload) => {
      console.log("Received track state change:", payload);
      const { userId, trackType, enabled } = payload;
      
      setPeers((prevPeers) => {
        return prevPeers.map((peer) => {
          if (peer.peerID === userId && peer.stream) {
            const tracks = trackType === 'video' 
              ? peer.stream.getVideoTracks() 
              : peer.stream.getAudioTracks();
            
            tracks.forEach(track => {
              track.enabled = enabled;
            });
          }
          return peer;
        });
      });
    };

    socket.on("track-state-change", handleTrackStateChange);

    // Chat: Listen for incoming messages (only from others)
    const handleReceiveChatMessage = (payload) => {
      console.log('[CHAT] Received:', payload, 'My ID:', socket.id);
      // Only add messages that are NOT from the current user
      if (payload.senderId !== socket.id) {
        setChatMessages((prev) => [
          ...prev,
          {
            message: payload.message,
            senderName: payload.senderName,
            senderId: payload.senderId,
            timestamp: payload.timestamp,
            self: false,
          },
        ]);
      } else {
        console.log('[CHAT] Ignoring own message from server');
      }
    };
    socket.on("receive-chat-message", handleReceiveChatMessage);

    // Cleanup these listeners when the component unmounts or when stream/name change
    return () => {
      socket.off("all-users", handleAllUsers);
      socket.off("user-connected", handleUserConnected);
      socket.off("user-joined", handleUserJoined);
      socket.off("receiving-returned-signal", handleReceivingReturnedSignal);
      socket.off("track-state-change", handleTrackStateChange);
      socket.off("receive-chat-message", handleReceiveChatMessage);
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
    if (name && stream && roomId) {
      joinRoom();
    }
  }, [name, stream, roomId]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      cleanupConnections();
      socket.off("all-users");
      socket.off("user-connected");
      socket.off("user-joined");
      socket.off("receiving-returned-signal");
      socket.off("user-disconnected");
      socket.off("track-state-change");
      socket.off("receive-chat-message");
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
    setRoomId("");
    setChatMessages([]); // Clear chat messages when leaving
    joinedRef.current = false;
  };

  // Function to notify other users about track state changes
  const notifyTrackStateChange = (trackType, enabled) => {
    socket.emit("track-state-change", {
      roomId,
      trackType,
      enabled,
      userId: socket.id
    });
  };

  // FIXED: Function to send chat message with duplicate prevention
  const sendChatMessage = (message) => {
    if (!roomId || !name || !me) {
      console.log("Cannot send message: missing roomId, name, or me");
      return;
    }
    console.log('[CHAT] Sending:', { roomId, message, senderName: name, senderId: me });
    
    const timestamp = Date.now();
    
    // Add message locally for immediate display
    setChatMessages((prev) => {
      // Check if this exact message already exists (prevent duplicates)
      const exists = prev.some(msg => 
        msg.message === message && 
        msg.senderId === me && 
        Math.abs(msg.timestamp - timestamp) < 1000 // Within 1 second
      );
      
      if (exists) {
        console.log('[CHAT] Preventing duplicate local message');
        return prev;
      }
      
      return [
        ...prev,
        {
          message,
          senderName: name,
          senderId: me,
          timestamp,
          self: true,
        },
      ];
    });
    
    // Send to server to broadcast to other users
    socket.emit("send-chat-message", {
      roomId,
      message,
      senderName: name,
      senderId: me,
    });
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
        joinRoom,
        leaveRoom,
        setStream,
        notifyTrackStateChange,
        updatePeerStreams,
        chatMessages,
        sendChatMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };