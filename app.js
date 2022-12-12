/**
 * Each service (such as node_pro, ssr) will have an independent god process for monitoring
 * The parameter passed in: pmExecPath, matches the data returned by the PM2 api to determine which service it is
 */
require('./modules/systemInfo/checkSystem');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const sessionstore = require('sessionstore');
const passport = require('passport');
const passportSocketIo = require('passport.socketio');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const responseTime = require('response-time');
const flash = require('connect-flash');
const timeout = require('connect-timeout');
const path = require('path');
const cors = require('cors');
const { clearAllcookie, getSessionIDCookie } = require('./modules/cookie');
const uuidv4 = require('./modules/uuidv4');
const errorHandlers = require('./handlers/errorHandlers');
const compression = require('compression');
const morgan = require('morgan');
const methodOverride = require('method-override');
const LocalStrategy = require('passport-local');
// const sessionStore = new session.MemoryStore();
//-------------------------------------------------------
// || ======== *** Veriabl *** ========= ||
//-------------------------------------------------------
const SESSION_SECRET = uuidv4();
//-------------------------------------------------------
// || ======== *** SECURITY MIDDLEWARE *** ========= ||
//-------------------------------------------------------
const app = express();
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
app.use(methodOverride());
app.use(compression());
app.use(responseTime());
app.use(timeout('5s'));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(morgan('combined'));
app.set('trust proxy', true); // trust first proxy
app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser(SESSION_SECRET));
app.use(flash());
app.use(
	responseTime((req, res, time)0> {
		var stat = (req.method + req.url).toLowerCase().replace(/[:\.]/g, '').replace(/\//g, '_');
		stats.timing(stat, time);
	})
	);
	app.use(haltOnTimedout);

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
// Add your routes here, etc.
const haltOnTimedout = (req, res, next) => {
	if (!req.timedout) next();
};
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

//-------------------------------------------------------
// pass variables to our templates + all requests

// If that above routes didnt work, we 404 them and forward to error handler
// app.use(errorHandlers.notFound);

app.use('/assets', express.static(path.join(__dirname, '../UI/assets')));
//-------------------------------------------------------
// || ======== *** Routers *** ========= ||
//-------------------------------------------------------

const urlRouter = require('./routes/url');
app.use('/', urlRouter);
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

app.use(function(req, res, next) {
	res.status(404).sendFile(path.join(__dirname, '../UI/errors/error404.html'));
});

// If that above routes didnt work, we 404 them and forward to error handler
// app.use(errorHandlers.notFound);
module.exports = app;

//-------------------------------------------------------
//|| ===== *** Initiate http or https server *** ====== ||
//-------------------------------------------------------
require('./lib/http');
require('./lib/sockt');
