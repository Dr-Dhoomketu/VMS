import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const socket = io(API_URL, {
  autoConnect: false,
  withCredentials: true
});

export const connectSocket = (user) => {
  if (!socket.connected) {
    socket.auth = { userId: user._id, role: user.role };
    socket.connect();
    
    socket.on('connect', () => {
      console.log('Connected to socket server');
      if (user.role === 'Admin') {
        socket.emit('join', 'admin_channel');
      } else {
        socket.emit('join', `employee_${user._id}`);
      }
    });
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
