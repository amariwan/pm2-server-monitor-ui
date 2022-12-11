/**
 * Each service (such as node_pro, ssr) will have an independent god process for monitoring
 * The parameter passed in: pmExecPath, matches the data returned by the pm2 api to determine which service it is
 */
require('../modules/systemInfo/checkSystem');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const sessionstore = require('sessionstore');
const passportSocketIo = require('passport.socketio');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const responseTime = require('response-time');
const flash = require('connect-flash');
const timeout = require('connect-timeout');
const https = require('https');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { clearAllcookie, getSessionIDCookie } = require('../modules/cookie');
const uuidv4 = require('../modules/uuidv4');
const errorHandlers = require('../handlers/errorHandlers');
const { exec } = require('child_process');
const socketIo = require('socket.io');
const pm2 = require('pm2');
const os = require('os');
const fs = require('fs');
const { debug } = require('console');
const db = require('../database/index');
const si = require('systeminformation');
const pm2List = require('../modules/PM2/PM2List');
const memoryString = require('../modules/systemInfo/memory');
const getCpuUsage = require('../modules/systemInfo/cpuUsage');
const timeString = require('../modules/time');
const compression = require('compression');
//-------------------------------------------------------
// || ======== *** veriabl *** ========= ||
//-------------------------------------------------------
const config_data = require('../.config/config.json');
const hostname = os.hostname();
const cpus = os.cpus().length;
const totalmemNum = os.totalmem();
const totalmem = memoryString(os.totalmem());
const nodev = process.version;
const godid = process.pid;
const portAppend = 0; // additional port number
const cpuThreshold = 90; // CPU Threshold (System)
global.sessionUser = null;
// Add some values to the port as the port number for http and ws
const name = config_data.name;
const port = config_data.port || portAppend;
var loginSystem = config_data.loginsystem;
loginSystem = loginSystem || false;
var isLoginSystem;
if (loginSystem === false) {
	isLoginSystem = false;
} else {
	isLoginSystem = true;
}
const isHttps = config_data.https;
const SESSION_SECRET = uuidv4();
//-------------------------------------------------------
// || ======== *** SECURITY MIDDLEWARE *** ========= ||
//-------------------------------------------------------
const app = express();
app.use(compression());
app.use(responseTime());
app.use(timeout('5s'));
// Add your routes here, etc.
const haltOnTimedout = (req, res, next) => {
	if (!req.timedout) next();
};
app.use(haltOnTimedout);
/* Adding a response time header to the response. */

app.use(responseTime());

// var stats = new StatsD();

// stats.socket.on('error', function(error) {
// 	console.error(error.stack);
// });
// app.use(
// 	responseTime(function(req, res, time) {
// 		var stat = (req.method + req.url).toLowerCase().replace(/[:\.]/g, '').replace(/\//g, '_');
// 		stats.timing(stat, time);
// 	})
// );
// async function cpuData() {
// 	try {
// 		const data = await si.cpu();
// 		console.log(data);
// 		const te = await si.cpuTemperature();
// 		console.log(te);
// 		const wd = await si.battery();
// 		console.log(wd);
// 		const bb = await si.bios();
// 		console.log(bb);
// 		const ll = await si.fullLoad();
// 		console.log(ll);
// 		const ooo = await si.networkInterfaces();
// 		console.log(ooo);
// 	} catch (e) {
// 		console.log(e);
// 	}
// }
// cpuData();
//

//setting CSP

// adding Helmet to enhance your API's security
// app.use(helmet());
// app.use(helmet.contentSecurityPolicy({
// 	defaultSrc: [ `'none'` ],
// 	styleSrc: [ `'self'`, `'unsafe-inline'` ],
// 	scriptSrc: [ `'self'` ],
// 	imgSrc: [ `'self'` ],
// 	connectSrc: [ `'self'` ],
// 	frameSrc: [ `'self'` ],
// 	fontSrc: [ `'self'`, 'data:' ],
// 	objectSrc: [ `'self'` ],
// 	mediaSrc: [ `'self'` ]
// }));
// app.use(helmet.hidePoweredBy());
// app.use(
// 	helmet.hsts({
// 		maxAge: 5184000
// 	})
// );

// This code is used to set the 'trust proxy' value to true.
app.set('trust proxy', true); // trust first proxy
// This code disables the x-powered-by header, which would otherwise
// provide information about the server software that is running the
// application.
app.disable('x-powered-by');

// Sessions allow us to Contact data on visitors from request to request
// This keeps admins logged in and allows us to send flash messages
// store: new FileStore(),
app.use(
	session({
		name: 'session_id',
		saveUninitialized: true,
		resave: false,
		rolling: false,
		secret: SESSION_SECRET,
		store: sessionstore.createSessionStore(),
		cookie: {
			path: '/',
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24,
			sameSite: 'none',
			secure: true,
			HostOnly: true
		}
	})
);

// This code parses the request body into a JSON object and assigns it to the request object
// as req.body

app.use(express.json());
/* This is a middleware that is used to parse the body of the request. */
// enabling CORS for all requests
app.use(
	cors({
		// origin: [ `https://${hostname}:${port}` ], //frontend server localhost:8080
		origin: true, //frontend server localhost:8080
		methods: [ 'GET', 'POST', 'PUT', 'DELETE' ],
		credentials: true, // enable set cookie
		optionsSuccessStatus: 200,
		credentials: true
	})
);

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
/*
 Use cookieParser and session middlewares together.
 By default Express/Connect app creates a cookie by name 'connect.sid'.But to scale Socket.io app,
 make sure to use cookie name 'jsessionid' (instead of connect.sid) use Cloud Foundry's 'Sticky Session' feature.
 W/o this, Socket.io won't work if you have more than 1 instance.
 If you are NOT running on Cloud Foundry, having cookie name 'jsessionid' doesn't hurt - it's just a cookie name.
 */
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
// This code is used to parse cookies for the express app
// The cookie parser is imported from the cookie-parser module
// The cookie parser is used to parse cookies for the express app
// The cookie parser is used to parse cookies to extract the session id
app.use(cookieParser(SESSION_SECRET));
// flash is a function that stores a message in the session and makes it available on the next request
// flash is used to show a message after a post request
// flash is used to display success messages or error messages
app.use(flash());
//-------------------------------------------------------
// pass variables to our templates + all requests

// If that above routes didnt work, we 404 them and forward to error handler
// app.use(errorHandlers.notFound);

app.use('/assets', express.static(path.join(__dirname, '../UI/assets')));
//-------------------------------------------------------
// || ======== *** Routers *** ========= ||
//-------------------------------------------------------

const urlRouter = require('../routes/url');
app.use('/', urlRouter);
const authRouter = require('../routes/auth');
app.use('/auth', authRouter);

app.use(function(req, res, next) {
	res.status(404).sendFile(path.join(__dirname, '../UI/errors/error404.html'));
});

// If that above routes didnt work, we 404 them and forward to error handler
// app.use(errorHandlers.notFound);

//-------------------------------------------------------
//|| ===== *** Initiate http or https server *** ====== ||
//-------------------------------------------------------
var httpServer;

if (isHttps) {
	// set https
	var ssl_keys = config_data.ssl_keys;
	var ssl_cert = '';
	var ssl_key = '';
	// console.log(ssl_keys);
	if (ssl_keys === undefined || ssl_keys.length <= null) {
		exec('bash ./generate-ssl.bash', (err, stdout, stderr) => {
			if (err) {
				console.log(err);
				return;
			}
			// the *entire* stdout and stderr (buffered)
			console.log(`stdout: ${stdout}`);
			console.log(`stderr: ${stderr}`);
		});
		ssl_cert = path.join(__dirname, '../.config/ssl/server.crt');
		ssl_key = path.join(__dirname, '../.config/ssl/server.key');
	} else {
		ssl_keys = ssl_keys[0];
		ssl_cert = ssl_keys.cert || path.join(__dirname, '../.config/ssl/server.crt');
		ssl_key = ssl_keys.key || path.join(__dirname, '../.config/ssl/server.key');
	}
	// console.log(`ss ssl_cert: ${ssl_cert}`, ssl_key);
	httpServer = https.createServer(
		// Provide the private and public key to the server by reading each
		// file's content with the readFileSync() method.
		{
			key: fs.readFileSync(ssl_key, 'utf8'),
			cert: fs.readFileSync(ssl_cert, 'utf8')
		},
		app
	);
	httpServer.listen(port, (err) => {
		if (err) {
			throw err;
		} else {
			console.log(`🛰️ Monitor Server running in the https://${hostname}:${port}`);
		}
	});
} else {
	httpServer = http.createServer(app);
	httpServer.listen(port, () => {
		console.log(`🛰️  Monitor Server running in the http://${hostname}:${port}`);
	});
}

//-------------------------------------------------------
// Socket.io
//-------------------------------------------------------

const io = socketIo(httpServer); // Creating a socket.io server and attaching it to the http server.

// Node.js program to demonstrate the
// os.platform() method

// Printing os.platform() value
var platform = os.platform();

// new connection received

io.on('connection', (socket) => {
	console.log('websocket server connect!');
	console.log(socket.handshake.headers.cookie);
	console.log(socket.handshake.headers);
	if (sessionUser) {
		const timer = setInterval(async () => {
			Promise.all([ pm2List(), getCpuUsage(), si.osInfo() ]).then((val) => {
				const data = val[0];
				const totalData = {
					hostname,
					cpus,
					cpuUsage: `${val[1]}`,
					cpuUsageCls: val[1] >= cpuThreshold ? true : false,
					totalmem,
					freemem: memoryString(os.freemem()),
					memUsage: `${Math.round(os.freemem() * 100 / os.totalmem())}`,
					node_version: nodev,
					godid,
					memory: 0,
					cpu: 0,
					restart: 0
				};
				let systemInfo = {};
				systemInfo.osInfo = val[2];
				if (data && data.length > 0) {
					const processData = [];
					let totalUptime;
					let instances = 0;
					data.forEach((t) => {
						const memory = t.monit ? Number(t.monit.memory) : 0;
						totalData.memory += memory;
						instances++;
						const cpu = t.monit ? Math.min(parseInt(t.monit.cpu), 100) : 0;
						totalData.cpu = totalData.cpu + cpu;
						totalData.name = t.name;
						totalData.pm_version = `v${t.pm2_env._pm2_version || 0}`;
						totalData.restart += t.pm2_env.restart_time;

						// boot mode
						let mode = t.pm2_env.exec_mode;
						if (mode.indexOf('_mode') > 0) {
							mode = mode.substring(0, mode.indexOf('_mode'));
						}

						let processUptime = '-';
						if (t.pm2_env.status === 'online') {
							processUptime = timeString(t.pm2_env.pm_uptime);

							// Take the smallest uptime
							if (!totalUptime) {
								totalUptime = t.pm2_env.pm_uptime;
							} else if (totalUptime > t.pm2_env.pm_uptime) {
								totalUptime = t.pm2_env.pm_uptime;
							}
						}
						processData.push({
							name: t.name,
							mode,
							pmid: t.pm_id,
							pid: t.pid,
							memory: memoryString(memory),
							cpu: `${cpu}%`,
							cpuCls: cpu >= cpuThreshold ? true : false,
							uptime: processUptime,
							restart: t.pm2_env.restart_time,
							status: t.pm2_env.status,
							user: t.pm2_env.username
						});
					});
					totalData.instances = `x${instances}`;
					totalData.totalUptime = totalUptime ? totalUptimeString(totalUptime) : '0';
					totalData.cpu = `${Math.round(totalData.cpu / instances)}%`;
					totalData.cpuCls = Math.round(totalData.cpu / instances) >= cpuThreshold ? true : false;
					totalData.memory = memoryString(totalData.memory / instances);
					totalData.platform = platform;
					totalData.architecture = os.arch();
					totalData.userInfo = os.userInfo();
					totalData.release = os.release();
					totalData.version = os.version();
					totalData.networkInterFaces = os.networkInterfaces();
					socket.emit('stats', { totalData, processData, systemInfo });
				} else {
					socket.emit('stats', { totalData, systemInfo });
				}
			});
		}, socket.handshake.query.interval || 1000);

		// After disconnecting, clear the timer
		socket.on('startApp', (appName) => {
			pm2.start(appName, (err, x) => {
				if (err) return socket.emit('serverInfo', 'error', err);
				else socket.emit('serverInfo', 'success', x[0].name + ' ' + x[0].status);
			});
		});
		// After disconnecting, clear the timer
		socket.on('restartApp', (appName) => {
			pm2.restart(appName, (err, x) => {
				if (err) return socket.emit('serverInfo', 'error', err);
				else socket.emit('serverInfo', 'success', x[0].name + ' ' + x[0].status);
			});
		});
		// After disconnecting, clear the timer
		socket.on('deleteApp', (appName) => {
			pm2.delete(appName, (err, x) => {
				if (err) return socket.emit('serverInfo', 'error', err);
				else socket.emit('serverInfo', 'success', x[0].name + ' ' + x[0].status);
			});
		});
		// After disconnecting, clear the timer
		socket.on('stopApp', (appName) => {
			pm2.stop(appName, (err, x) => {
				if (err) return socket.emit('serverInfo', 'error', err);
				else socket.emit('serverInfo', 'success', x[0].name + ' ' + x[0].status);
			});
		});
		socket.on('test', (value) => {
			socket.emit('serverInfo', value);
		});
		// After disconnecting, clear the timer
		socket.on('disconnect', () => {
			console.log('disconnect!');
			clearInterval(timer);
		});
	} else {
		console.log('not logger');
	}
});
