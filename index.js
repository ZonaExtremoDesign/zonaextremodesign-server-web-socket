import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
let clients = [];

// Mantener clientes conectados
wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("💻 Cliente conectado (total:", clients.length, ")");

  ws.on("close", () => {
    clients = clients.filter(c => c !== ws);
    console.log("❌ Cliente desconectado (total:", clients.length, ")");
  });
});

// Endpoint para emitir acciones a todos los clientes
app.post("/emitir", (req, res) => {
  const { motivo = "flash", nombre = "Anonimo", monto = 0 } = req.body;
  const payload = JSON.stringify({ motivo, nombre, monto });

  clients.forEach((ws, i) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(payload);
      console.log(`📡 Enviado a cliente #${i+1}:`, payload);
    }
  });

  res.json({ status: "ok", enviados: clients.length, payload });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 WS server corriendo en puerto ${PORT}`));
