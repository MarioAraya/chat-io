var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var sassMiddleware = require('node-sass-middleware');
var usernames = [];

server.listen(3000);
console.log('Servidor arriba...puerto 80');

//compila sass
app.use(
	sassMiddleware({
	    src: __dirname + '/public', 
	    dest: __dirname + '/public',
	    debug: true,       
	})
); 

app.use(require('express').static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	console.log('socket conectado...');
  	
	socket.on('nuevo user', function(data, callback){
		if(usernames.indexOf(data) != -1){
			callback(false);
		}
		else{
			callback(true);	
			socket.username = data;
			usernames.push(socket.username);
			updateUsernames();
		}
	});

	// actualizar usernames
	function updateUsernames(){
		io.sockets.emit('usernames', usernames);
	};

	// enviar msg
  	socket.on('enviar msg', function (data) {
    	io.sockets.emit('nuevo msg', { msg: data, user: socket.username });
  	});

  	// disconnect
  	socket.on('disconnect', function (data) {
  		console.log('disconnect_1 '+socket.username);
    	if(!socket.username){
    		return;
    	}
		console.log('disconnect_2');
    	usernames.splice(usernames.indexOf(socket.username), 1);
   		updateUsernames(); 	
  	});
});