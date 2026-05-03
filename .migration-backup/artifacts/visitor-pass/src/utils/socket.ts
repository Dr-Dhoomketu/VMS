import { io } from 'socket.io-client';
import { API_URL } from '@/lib/api';

const socket = io(API_URL, {
  autoConnect: false,
  withCredentials: true,
  path: '/socket.io',
});

export const connectSocket = (user: { _id: string; role: string }) => {
  if (!socket.connected) {
    socket.auth = { userId: user._id, role: user.role };
    socket.connect();
    socket.on('connect', () => {
      if (user.role === 'Admin') {
        socket.emit('join_admin');
      } else {
        socket.emit('join_employee', user._id);
      }
    });
  }
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export default socket;
