var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var session = require('express-session')({
    secret: 'my-little-secret-hash-19970716',
    resave: true,
    saveUninitialized: true
});

var bodyParser = require('body-parser');

var sharedsession = require("express-socket.io-session");

var userNameList = ["Karthi", "Admin", "Kailash", "Venky", "Viikhas", "Appa"];
var passList = ["karthi123", "admin", "ktr123", "venky123", "cupid123", "appa123"];

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session);

io.use(sharedsession(session));

http.listen(8080, function(){
    console.log('listening on *:8080');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/login.html');
});

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
  if (req.session && req.session.userOnline === true)
    return next();
  else
    return res.sendFile(__dirname + '/login.html');
};
 
// Login endpoint
app.post('/login', function (req, res) {

    var index = userNameList.indexOf(req.body.username);

  if (!req.body.username || !req.body.password) {
    res.sendFile(__dirname + '/login.html');    
  } else if(req.body.username === userNameList[index] && req.body.password === passList[index]) {
    req.session.userName = req.body.username;
    req.session.userOnline = true;
    console.log(req.session.userName + " logged in.");
    res.sendFile(__dirname + '/chat.html');
  }
  else{
    res.sendFile(__dirname + '/login.html');
  }
});
 
// Logout endpoint
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.send("logout success!");
});
 
// Get content endpoint
app.get('/content', auth, function (req, res) {
    res.send("You can only see this after you've logged in.");
});

io.on('connection', function(socket){
    console.log(socket.handshake.session.userName + " joined chat room");

    socket.on('chat-message', function(msg){
        console.log(msg);
        io.emit('chat-message', {
            handle: socket.handshake.session.userName,
            message: msg
        });
    });

    socket.on('typing', function(){
        socket.broadcast.emit('typing', socket.handshake.session.userName);
    });

});