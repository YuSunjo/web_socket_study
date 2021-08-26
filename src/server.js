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
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`)
    })
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome");
    });
})


httpServer.listen(3000, handleListen);