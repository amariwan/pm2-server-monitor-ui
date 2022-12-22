/**
 * Each service (such as node_pro, ssr) will have an independent god process for monitoring
 * The parameter passed in: pmExecPath, matches the data returned by the PM2 api to determine which service it is
 */
require('./modules/systemInfo/checkSystem');
require('./modules/systemInfo/internetConnectivity');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const session = require('express-session');
const helmet = require('helmet');
const sessionstore = require('sessionstore');
const flash = require('connect-flash');
const responseTime = require('response-time');
const passportSocketIo = require('passport.socketio');
const passport = require('passport');
const timeout = require('connect-timeout');
const path = require('path');
const cors = require('cors');
const uuidv4 = require('./modules/uuidv4');
const errorHandlers = require('./handlers/errorHandlers');
const compression = require('compression');
const morgan = require('morgan');
const methodOverride = require('method-override');
const LocalStrategy = require('passport-local');
//-------------------------------------------------------
// || ======== *** Veriabl *** ========= ||
//-------------------------------------------------------
const SESSION_SECRET = uuidv4();
//-------------------------------------------------------
// || ======== *** SECURITY MIDDLEWARE *** ========= ||
//-------------------------------------------------------
// This code parses the request body into a JSON object and assigns it to the request object
// as req.body
app.use(express.json());
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
// This code is used to set the 'trust proxy' value to true.
app.set('trust proxy', true); // trust first proxy
// This code disables the x-powered-by header, which would otherwise
// provide information about the server software that is running the
// application.
app.disable('x-powered-by');
// app.use(
// 	cookieSession({
// 		name: 'session',
// 		keys: [ uuidv4(), uuidv4() ]
// 	})
// );
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
		// store: sessionstore.createSessionStore(),
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
// This code is used to parse cookies for the express app
// The cookie parser is imported from the cookie-parser module
// The cookie parser is used to parse cookies for the express app
// The cookie parser is used to parse cookies to extract the session id
// app.use(
// 	cookieSession({
// 		keys: [ uuidv4(), uuidv4() ]
// 	})
// );

app.use(methodOverride());
app.use(compression());
app.use(responseTime());
app.use(timeout('5s'));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// Add your routes here, etc.
const haltOnTimedout = (req, res, next) => {
	if (!req.timedout) next();
};
app.use(haltOnTimedout);
// app.use(morgan('combined'));

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
app.use(
	express.urlencoded({
		extended: true
	})
);

app.use(express.json());
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(cookieParser(SESSION_SECRET)); // any string ex: 'keyboard cat'
// flash is a function that stores a message in the session and makes it available on the next request
// flash is used to show a message after a post request
// flash is used to display success messages or error messages
app.use(flash());
const httpServer = require('./modules/http/http');
const socketIo = require('socket.io');

const io = socketIo(httpServer); // Creating a socket.io server and attaching it to the http server.

app.set('socketio', io);
//-------------------------------------------------------
// pass variables to our templates + all requests

// If that above routes didnt work, we 404 them and forward to error handler
// app.use(errorHandlers.notFound);

app.use('/assets', express.static(path.join(__dirname, './UI/assets')));
//-------------------------------------------------------
// || ======== *** Routers *** ========= ||
//-------------------------------------------------------

const indexRouter = require('./routes/index');
app.use('/', indexRouter);
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

app.use(function(req, res, next) {
	res.status(404).sendFile(path.join(__dirname, '../UI/errors/error404.html'));
});

// pass variables to our templates + all requests

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
	/* Development Error Handler - Prints stack trace */
	app.use(errorHandlers.developmentErrors);
}
// production error handler
app.use(errorHandlers.productionErrors);

module.exports = app;

require('./modules/http/http');
require('./modules/socket/socket');
