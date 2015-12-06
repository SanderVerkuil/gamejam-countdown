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

app.get('/reset', function(req, res) {
  console.log(playing);
  playing = false;
  res.sendFile(__dirname + '/index.html');
});

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

  var target = moment(options.time.end);
  var start = moment(options.time.start)
  var totalTime = target.diff(start);

  var now = moment();
  var diff = target.diff(now);
  var sdiff = start.diff(now);
  console.log(sdiff);
  if (start.diff(now) < 0)
  {
    if (diff < options.song.start)
    {
      if (!playing) {
        player.play(options.song.location);
        console.log("Started to play at " + now.format("YYYY-MM-DD, HH:mm:ss"));
        playing = true;
      }
      console.log(diff);
    } else {
      if (playing) {
        console.log("Started to play at " + now.format("YYYY-MM-DD, HH:mm:ss"));
        playing = false;
      }
    }
    if (diff > 0)
      io.emit('tick', {start: now, end: target, percentage: diff / totalTime, complete: false, started: true});
    else {
      io.emit('tick', {start: target, end: target, percentage: 0, complete: true, started: true});
    }
  } else {
    io.emit('tick', {start: start, end: target, percentage: 100, complete: false, started: false});
  }
}, 990)

http.listen(3000, function() {
  console.log('listening on *:3000');
})
