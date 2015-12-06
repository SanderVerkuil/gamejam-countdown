var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');
var player = require('play-sound')(opts={});
var YAML = require('yamljs');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
})

app.use('/public', express.static(__dirname + '/public'));

io.on('connection', function(socket){
  console.log('A user connected');
  socket.on('disconnect', function() {
    console.log('A user disconnected');
  })
})

var playing = false;

setInterval(function() {
  var options = YAML.load("options.yml");

  var target = moment(options.options.time.end);
  var start = moment(options.options.time.start)
  var totalTime = target.diff(start);

  var now = moment();
  var diff = target.diff(now);
  if (!playing && diff < options.options.song.start)
  {
    player.play(options.options.song.location)
    playing = true;
  }
  if (start.diff(now) < 0)
  {
    if (diff > 0)
      io.emit('tick', {start: now, end: target, percentage: diff / totalTime, complete: false, started: true});
    else {
      io.emit('tick', {start: target, end: target, percentage: 0, complete: true, started: true});
    }
  } else {
    io.emit('tick', {start: start, end: target, percentage: 100, complete: false, started: false});
  }
}, 1000)

http.listen(3000, function() {
  console.log('listening on *:3000');
})
