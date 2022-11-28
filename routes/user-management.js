const { encrypt, decrypt } = require('../modules/crpyto');
const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');

router.get('/user-get', (req, res) => {
	const userID = decrypt(req.body.userID);

	db.query('SELECT * FROM users WHERE userID =' + userID, function(err, result) {
		if (err) throw err;
		console.log(result);
		res.send(result);
	});
});

router.post('/user-update', (req, res) => {
	/* This is getting the data from the request body.*/
	const userID = decrypt(req.body.userID);
	const role = decrypt(req.body.role).toLowerCase();

	/* This is updating the data into the database. */
	db.query('UPDATE users SET role = ? WHERE userID = ?', [ role, userID ], (error, response) => {
		if (error) {
			res.send({
				msg: error
			});
		} else {
			res.send({
				msg: 'User successfully updated',
				code: 201
			});
		}
	});
});

router.post('/user-delete', (req, res) => {
	/* This is getting the data from the request body.*/
	const userID = decrypt(req.body.userID);

	/* This is updating the data into the database. */
	db.query('DELETE FROM users WHERE userID = ?', [ userID ], (error, response) => {
		if (error) {
			res.send({
				msg: error
			});
		} else {
			res.send({
				msg: 'User successfully deleted',
				code: 201
			});
		}
	});
});

/* This is exporting the router object. */
module.exports = router;
