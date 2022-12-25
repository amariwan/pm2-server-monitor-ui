const express = require('express');
const router = express.Router(); // Creating a router object.
const path = require('path');
const { clearAllcookie, getSessionIDCookie } = require('../modules/cookie');
const config_data = require('../.config/config.json');
// Add some values to the port as the port number for http and ws
var loginSystem = config_data.loginsystem;
loginSystem = loginSystem || false;
var isLoginSystem;
if (loginSystem === false) {
	isLoginSystem = false;
} else {
	isLoginSystem = true;
}
/* Telling the server to saerve the static files in the webUI folder. */
router.get('/', (req, res) => {
	console.log(getSessionIDCookie(req, res), '18');
	console.log(req.session.user, '19');

	if (isLoginSystem) {
		if (req.session.user != null) {
			res.sendFile(path.join(__dirname, '../UI/index.html'));
		} else {
			res.sendFile(path.join(__dirname, '../UI/auth/sign-in.html'));
		}
	} else {
		res.sendFile(path.join(__dirname, '../UI/' + 'index.html'));
	}
});

router.get('/login', (req, res) => {
	// var x = getSessionIDCookie(req, res);
	// console.log(x, '34');
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

/* This is exporting the router object. */
module.exports = router;
