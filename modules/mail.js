/* eslint no-console: 0 */

'use strict';

const nodemailer = require('nodemailer');
const config = require('../.config/config.json');

const sendMail = async () => {
	var auth = config.mailAuth;
	console.log(auth, '10');
	if (typeof auth === 'object') {
		let transporter = nodemailer.createTransport(auth[0]);

		// Message object
		let message = {
			from: 'kontakt@aland-mariwan.de', // Sender address
			to: 'dev@aland-mariwan.de', // List of recipients
			subject: 'Node Mailer', // Subject line
			html: '<h2 style="color:#ff6600;">Hello People!, Welcome to Bacancy!</h2>'
		};

		let info = await transporter.sendMail(message, function(err, info) {
			if (err) {
				console.log(err);
			} else {
				console.log(info);
			}
		});

		console.log('Message sent successfully!');
		console.log(nodemailer.getTestMessageUrl(info));

		// only needed when using pooled connections
		transporter.close();
	}
};

sendMail().catch((err) => {
	console.error(err.message);
	process.exit(1);
});

module.exports = sendMail;
