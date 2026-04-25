import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
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
