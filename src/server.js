import express from 'express';
import http from "http";
import WebSocket from "ws";

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + "/views");
app.use('/public', express.static(__dirname + '/public'));

// app.get("/*", (req, res) => res.redirect("/"));

app.get('/', (req, res) => res.render("home"));
const handleListen = () => console.log(`listening on 3000 port`);

const server = http.createServer(app);
const wss = new WebSocket.Server({server})

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "nicolo";
    console.log("Connected to Browser");
    socket.on("close", () => console.log("Disconnected from Server"));
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch (message.type) {
            case "new_message":
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname} : ${message.payload}`));
            case "nickname":
                console.log(message.payload);
                socket["nickname"] = message.payload;
        }
    })
    socket.send("hello!!!");
});


server.listen(3000, handleListen);