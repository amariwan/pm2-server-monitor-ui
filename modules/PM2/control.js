const pm2 = require('pm2');

const PM2Control = (appName, Type) => {
	switch (Type) {
		case value:
			pm2.stop(appName, (err, x) => {
				if (err) return socket.emit('serverInfo', 'error', err);
				else socket.emit('serverInfo', 'success', x[0].name + ' ' + x[0].status);
				sendMsg('serverInfo ' + 'success ' + x[0].name + ' ' + x[0].status);
			});
			break;

		default:
			break;
	}
};

module.exports = PM2Control;
