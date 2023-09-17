import { ExpressPeerServer } from "peer";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
  path: "/",
});

app.use(cors());
app.use("/peerjs", peerServer);
