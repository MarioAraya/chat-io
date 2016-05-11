var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var sassMiddleware = require('node-sass-middleware');
var nodemailer = require('nodemailer');
var usernames = [];



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
    	if(!socket.username){
    		return;
    	}
    	usernames.splice(usernames.indexOf(socket.username), 1);
   		updateUsernames(); 	
  	});
});

// create reusable transporter object using the default SMTP transport 
var transporter = nodemailer.createTransport('smtps://mario.araya.romero@gmail.com:picosheriff@smtp.gmail.com');
 
// setup e-mail data with unicode symbols 
var mailOptions = {
    from: '"Mario Araya 👥" <arayaromero@microsoft.com>', // sender address 
    to: 'arayaromero@yahoo.com, arayaromero@gmail.com', // list of receivers 
    subject: 'Holi ✔', // Subject line 
    text: 'Hello world 🐴 correo from NodeJS (nodemailer)', // plaintext body 
    html: '<b>Hello world 🐴</b>' // html body 
};
/* 
// send mail with defined transport object 
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
*/

server.listen(3000);
console.log('Servidor arriba...puerto 3000');