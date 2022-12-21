const express = require('express');
const router = express.Router(); // Creating a router object.
const path = require('path');
const { getSessionIDCookie } = require('../modules/cookie');
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
/* Telling the server to serve the static files in the webUI folder. */
router.get('/', (req, res) => {
	// console.log(getSessionIDCookie(req));
	if (isLoginSystem) {
		if (sessionUser) {
			res.sendFile(path.join(__dirname, '../UI/index.html'));
		} else {
			res.sendFile(path.join(__dirname, '../UI/auth/sign-in.html'));
		}
	} else {
		res.sendFile(path.join(__dirname, '../UI/' + 'index.html'));
	}
});

/* This is exporting the router object. */
module.exports = router;
