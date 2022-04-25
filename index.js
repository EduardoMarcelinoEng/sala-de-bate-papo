const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const PORT = process.env.PORT || 80;
const moment = require('moment-timezone');

app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.get('/', (req, res)=>{
    try {
        return res.render('pages/nickname', {
            title: 'Sala de Bate-Papo'
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

app.get('/chat', (req, res)=>{
    try {
        if(!req.query.nickname) return res.status(301).redirect('/');
        return res.render('pages/chat', {
            title: 'Chat'
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

const server = http.createServer(app);
const io = new Server(server);

let messages = []

io.on('connection', (socket) => {

    socket.broadcast.emit("new-participant", {
        nickname: socket.handshake.query.nickname
    });

    socket.on("new-message", data=>{

        let date = moment().tz('America/Sao_Paulo');

        let objJSON = {
            nickname: socket.handshake.query.nickname,
            message: data,
            createdAt: date
        }

        messages.push(objJSON);

        socket.broadcast.emit("new-message", objJSON);
        
    });

    socket.on("get-messages", data=>{
        data(messages);
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("participant-exited", {
            nickname: socket.handshake.query.nickname
        });
    });
    
});

setInterval(()=>{
    messages = messages.filter(message=>moment(message.createdAt).tz('America/Sao_Paulo').add(1, 'hours') > moment().tz('America/Sao_Paulo'));
}, 1000);

server.listen(PORT, ()=>console.log(`Aplicação rodando na porta ${PORT}`));