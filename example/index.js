const http = require('http');
const port = 2002;
const monitor = require('../lib/index');
const option = {
	// Your server name, as a flag
	name: 'Monitoring',
	// your server listening port
	port: 4003,
	loginsystem: false, // false or localstorage or db
	users: [
		{
			username: 'admin',
			name: 'admin',
			lastname: 'admin',
			password: 'admin',
			role: 'admin'
		},
		{
			username: 'user',
			password: 'user',
			role: 'user'
		}
	],
	databank: [
		{
			// Host name for database connection:
			host: '127.0.0.1',
			// Port number for database connection:
			port: 3306,
			// Database user:
			user: 'root',
			// Password for the above database user:
			password: 'Tolasm99',
			// Database name:
			database: 'tf',
			// Whether or not to automatically check for and clear expired sessions:
			clearExpired: true,
			// How frequently expired sessions will be cleared; milliseconds:
			checkExpirationInterval: 900000,
			// The maximum age of a valid session; milliseconds:
			expiration: 86400000,
			// Whether or not to create the sessions database table, if one does not already exist:
			createDatabaseTable: true,
			// Number of connections when creating a connection pool:
			connectionLimit: 1,
			// Whether or not to end the database connection when the store is closed.
			// The default value of this option depends on whether or not a connection was passed to the constructor.
			// If a connection object is passed to the constructor, the default value for this option is false.
			endConnectionOnClose: true,
			charset: 'utf8mb4_bin'
		}
	],
	https: true,
	ssl_keys: [
		{
			key: '/Users/snow/development/OSZ-Teltow/backend/config/https_key/key.pem',
			cert: '/Users/snow/development/OSZ-Teltow/backend/config/https_key/cert.pem'
		}
	],
	web_config: {
		local: [
			{
				host: '127.0.0.1',
				port: 4003,
				https: true,
				show: true
			}
		]
	}
};

monitor(option);

const server = http.createServer((req, res) => {
	res.end('OK');
});
server.listen(port);
console.log(`Example server is running on http://127.0.0.1:${port}`);
