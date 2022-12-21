const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../modules/database/index');
const bcrypt = require('bcrypt'); // A library that is used to hash passwords.
const { encrypt, decrypt } = require('../modules/crpyto');
const { isEmail, checkUsername } = require('../modules/check_userOrEmail');
const { clearAllcookie, getSessionIDCookie } = require('../modules/cookie');
const config_data = require('../.config/config.json');
const isLocalOrDB = config_data.loginsystem;
const { checkDBTable, createUserTable } = require('../modules/database/check_db');
const saltRounds = 10; // The number of rounds to use when generating a salt
global.sessionUser = null;
var loginSystem = config_data.loginsystem;
loginSystem = loginSystem || false;
var isLoginSystem;
if (loginSystem === false) {
	isLoginSystem = false;
} else {
	isLoginSystem = true;
}
// router.post(
// 	'/auth',
// 	passport.authenticate('local-signin', {
// 		successRedirect: '/admin/index.html',
// 		failureRedirect: '/admin/login.html'
// 	})
// );

/* This is a post request that is used to register a user. */
router.post('/register', (req, res) => {
	/* This is getting the data from the request body. */
	const name = decrypt(req.body.name).toLowerCase();
	const lastname = decrypt(req.body.lastname).toLowerCase();
	const username = decrypt(req.body.username).toLowerCase();
	const email = decrypt(req.body.email).toLowerCase();
	const password = decrypt(req.body.password); //! I expect to receive an encrypted password
	/* This is checking if the email is valid. */
	if (!isEmail(email)) {
		res.status(203).send({
			msg: 'Invalid email',
			code: 101
		});
		return;
	}

	/* This is checking if the username is valid. */
	if (!checkUsername(username)) {
		res.status(203).send({
			msg:
				'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.',
			code: 102
		});
		return;
	}

	/* This is checking if the password is at least 8 characters long. */
	if (password.length < 8)
		return res.status(203).send({
			msg: 'Password must be at least 8 characters long.'
		});

	if (isLocalOrDB === 'db') {
		if (!checkDBTable('users')) {
			createUserTable();
		}
		/* This is checking if the username is already registered. */
		db.query('SELECT * FROM users WHERE username = ?', [ username ], function(err, result) {
			if (err)
				throw res.status(500).send({
					msg: err
				});
			if (result.length == 0) {
				/* This is checking if the Email is already registered. */
				db.query('SELECT * FROM users WHERE email = ?', [ email ], function(err, result) {
					if (err)
						throw res.status(500).send({
							msg: err
						});
					if (result.length == 0) {
						bcrypt.hash(password, saltRounds, (err, hash) => {
							/* This is inserting the data into the database. */
							db.query(
								'INSERT INTO users (name, lastname, username, email, password, role) VALUE (?,?,?,?,?)',
								[ name, lastname, username, email, hash, role ],
								(error, response) => {
									if (error && err) {
										res.status(500).send({
											msg: error || err
										});
									} else {
										res.status(200).send({
											msg: 'User successfully registered',
											code: 201
										});
									}
								}
							);
						});
					} else {
						res.status(203).send({
							msg: 'Email already registered',
							code: 100
						});
					}
				});
			} else {
				res.status(203).send({
					msg: 'username already registered',
					code: 100
				});
			}
		});
	} else if (isLocalOrDB === 'localstorage') {
	}
});
var index_kk = 0;

router.get('/login', (req, res) => {
	var x = getSessionIDCookie(req, res);
	console.log(x, '120');
	if (req.session.user) {
		global.sessionUser = req.session.user;
		req.session.user.isFirst = ++index_kk;
		res.status(200).send({
			msg: 'User already logged in',
			user: req.session.user,
			isFirst: req.session.user.isFirst,
			islogged: true,
			code: 200
		});
	} else {
		console.log('User not logged in');
		global.sessionUser = null;
		res.status(203).send({
			msg: 'User not logged in',
			islogged: false,
			code: 102
		});
	}
});

/* This is a post request that is used to login a user. */
router.post('/login', (req, res, next) => {
	// Unless we explicitly write to the session (and resave is false), the
	// store is never updated, even though a new session is generated on each
	// request. After we modify that session and during req.end(), it gets
	// persisted. On subsequent writes, it's updated and synced with the store.

	let username = decrypt(req.body.username);
	const password = decrypt(req.body.password);

	if (!checkUsername(username)) {
		res.status(203).send({
			msg:
				'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.',
			code: 102
		});
		return;
	}
	username = username.toLowerCase();

	/* This is checking if the user is registered. */
	if (isLocalOrDB === 'db') {
		db.query('SELECT * FROM users WHERE ' + userOrEmail + ' = ?', [ email ], (err, result) => {
			if (err) res.status(500).send(err);
			if (result.length > 0) {
				bcrypt.compare(password, result[0].password, (error, response) => {
					if (error) {
						res.status(500).send(error);
					} else if (err) {
						res.status(500).send(err);
					}
					if (response == true) {
						if (req.session.user) {
							res.status(200).send({
								user: req.session.user,
								code: 105
							});
						} else {
							getSessionIDCookie(req, res);
							req.session.user = {
								name: result[0].name,
								lastname: result[0].lastname,
								userID: result[0].userID,
								username: email,
								role: result[0].role,
								loggedIn: true
							};
							res.status(200).send({
								msg: 'successfully',
								user: req.session.user,
								islogged: true,
								code: 105
							});
						}
					} else {
						res.status(203).send({
							msg: 'Email or password incorrect',
							code: 105
						});
					}
				});
			} else {
				res.status(203).send({
					msg: 'Not registered user!',
					code: 104
				});
			}
		});
	} else if (isLocalOrDB === 'localstorage') {
		const user = findUser(config_data.users, username, password);
		if (typeof user === 'object') {
			var x = getSessionIDCookie(req, res);
			console.log(x, '212');
			req.session.user = user;
			req.session.user.isFirst = true;
			global.sessionUser = user;
			res.send({
				msg: 'successfully',
				islogged: true,
				code: 105
			});
			// accept(null, true);
			return;
		} else {
			res.status(203).send({
				msg: user,
				code: 104
			});
			return;
		}
	} else {
		res.status(203).send({
			msg: 'User not logged in',
			code: 102
		});
	}
});

const findUser = (users, username, password) => {
	var resule;
	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		const name = user.name;
		const lastname = user.lastname;
		const usernameLocal = user.username.toLowerCase();
		const passwordLocal = user.password;
		const role = user.role;
		if (usernameLocal === username) {
			if (passwordLocal === password) {
				return {
					UserFirstName: name,
					UserLastName: lastname,
					userName: username,
					UserRole: role,
					UserId: user.id,
					loggedIn: true
				};
			} else resule = 'password incorrect';
		} else resule = 'Username incorrect';
	}
	return resule;
};

router.get('/logout', (req, res, next) => {
	console.log('logout');
	// Upon logout, we can destroy the session and unset req.session.
	req.session.destroy();
	clearAllcookie(req, res);
	res.status(200).send('logout');
	next(); // this will give you the above exception
	global.sessionUser = null;
});

/* This is exporting the router object. */
module.exports = router;
