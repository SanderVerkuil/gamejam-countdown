var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
})

io.on('connection', function(socket){
  console.log('A user connected');
  socket.on('disconnect', function() {
    console.log('A user disconnected');
  })
})

var target = moment("2015-12-08T19:00:00+0100");
var start = moment("2015-12-07T11:00:00+0100")
var totalTime = target.diff(start);

setInterval(function() {
  var now = moment();
  var diff = target.diff(now);
  io.emit('tick', {start: now, end: target, percentage: diff / totalTime});
}, 1000)

http.listen(3000, function() {
  console.log('listening on *:3000');
})
