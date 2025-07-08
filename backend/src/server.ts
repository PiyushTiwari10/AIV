import app from "./app";
import { createServer } from "http";
import { WebSocketServer } from "./ws/ws.server";

const PORT = process.env.PORT || 4000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket server
const wsServer = new WebSocketServer(httpServer);

// Set the WebSocket server in the app
// This is a workaround for the circular dependency issue
(global as any).wsServer = wsServer;

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for potential use in other modules
export { wsServer };
