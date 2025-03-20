# 📹 Video Chat App  
A **real-time video conferencing application** built using **React.js, WebRTC, and Socket.io**, similar to Google Meet. Users can create and join meetings, share screens, and chat in real-time.  

## 🚀 Features  
✅ **Real-time video & audio communication** using WebRTC  
✅ **Multiple participants** in a single meeting  
✅ **Unique meeting links** for easy joining  
✅ **Screen sharing** for presentations  
✅ **In-meeting chat** with text messaging  
✅ **Mute/Unmute & Video On/Off toggles**  
✅ **Peer-to-peer communication** using WebRTC  
✅ **Efficient signaling** with Socket.io  

---

## 🛠 Tech Stack  
**Frontend:**  
- React.js (Vite for faster development)  
- WebRTC (getUserMedia, RTCPeerConnection, ICE candidates)  
- Socket.io-client  
- Tailwind CSS (for UI styling)  

**Backend:**  
- Node.js  
- Express.js  
- Socket.io  

---

## 📥 Installation & Setup  

### Prerequisites  
- Node.js installed  
- npm or yarn package manager  

### 1️⃣ Clone the Repository  
```sh
git clone https://github.com/your-repo/video-chat-app.git
cd video-chat-app
```

### 2️⃣ Install Dependencies  

#### 📌 Client  
```sh
cd client
npm install
```

#### 📌 Server  
```sh
cd server
npm install
```

### 3️⃣ Start the Server  
```sh
cd server
node index.js
```
or using **nodemon** (for auto-restart):  
```sh
nodemon index.js
```

### 4️⃣ Start the Client  
```sh
cd client
npm start
```

### 5️⃣ Open the App  
Go to **`http://localhost:3000`** in your browser and start a meeting. 🎥  

---

## 🔄 How It Works  
1️⃣ A user **creates a meeting** and gets a **unique meeting link**.  
2️⃣ Other participants **join using the same link**.  
3️⃣ WebRTC establishes a **peer-to-peer video & audio connection**.  
4️⃣ Socket.io handles **signaling for connection setup**.  
5️⃣ Users can **enable/disable audio/video, chat, and share screens**.  

---

## 🛠 Future Enhancements  
🔹 **Authentication (Sign in with Google)**  
🔹 **Recording feature**  
🔹 **Breakout rooms**  
🔹 **Improved UI with animations**  

---

## 🤝 Contributing  
Pull requests are welcome! Fork the repo, make changes, and submit a PR. 🎉  

---

## 📜 License  
This project is licensed under the **MIT License**.  
