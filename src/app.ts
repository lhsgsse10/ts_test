import express, { Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import fs from 'fs';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
let filteredWords: string[] = [];

// Reading words from data.txt
const dataFilePath = path.join(__dirname, 'data.txt');
const data = fs.readFileSync(dataFilePath, 'utf8');
filteredWords = data.split('\n').map((word) => word.trim());

app.get('/', function(req: Request, res: Response) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', function(socket: Socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on('chat message', function(msg) {
    let m = msg.m ? msg.m : '';
    let n = msg.n ? msg.n : 'nobody';

    filteredWords.forEach(word => {
      if (m.includes(word)) {
        m = m.replace(new RegExp(word, 'g'), '*'.repeat(word.length));
      }
    });

    let sendmsg = '[' + n + '] ' + m;
    console.log('message: ' + sendmsg);
    io.emit('chat message', { m: m, n: n }); // Sending the modified message object
  });
});

server.listen(9333, function() {
  console.log('listening on *:9333');
});

io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' });

io.on('connection', function(socket: Socket) {
  socket.broadcast.emit('hi');
});
