import express from 'express';
import http from "http";
import SocketIO from "socket.io";

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + "/views");
app.use('/public', express.static(__dirname + '/public'));

// app.get("/*", (req, res) => res.redirect("/"));

app.get('/', (req, res) => res.render("home"));
const handleListen = () => console.log(`listening on 3000 port`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// done 은 백엔드가 실행시키는 것임
wsServer.on("connection", socket => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`)
    })
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname);
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname));
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    })
    socket.on("nickname", (nickname) => socket["nickname"] = nickname)
})


httpServer.listen(3000, handleListen);