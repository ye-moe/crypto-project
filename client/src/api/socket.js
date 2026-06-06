// import { io } from "socket.io-client";

// export const socket = io("/", {
//   path: "/socket.io",
//   autoConnect: false,
// });

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "/";

export const socket = io(SOCKET_URL, {
  path: "/socket.io",
  autoConnect: false,
});