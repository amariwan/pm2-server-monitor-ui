const pm2 = require('pm2');
const { sendMsg } = require('../notification/discord');

const PM2Control = (appName, type) => {
	if (typeof appName != 'string' || appName == null) return false;
	if (typeof type != 'string' || type == null) return false;
	switch (type) {
		case 'stop':
			pm2.stop(appName, (err, x) => {
				if (err) return 'serverInfo', 'error', err;
				else 'serverInfo', 'success', x[0].name + ' ' + x[0].status;

				sendMsg('serverInfo ' + 'success ' + x[0].name + ' ' + x[0].status);
			});
			break;
		case 'start':
			pm2.start(appName, (err, x) => {
				if (err) return 'serverInfo', 'error', err;
				else 'serverInfo', 'success', x[0].name + ' ' + x[0].status;
				sendMsg('serverInfo ' + 'success ' + x[0].name + ' ' + x[0].status);
			});
			break;

		case 'restart':
			pm2.restart(appName, (err, x) => {
				if (err) return socket.emit('serverInfo', 'error', err);
				else socket.emit('serverInfo', 'success', x[0].name + ' ' + x[0].status);
				sendMsg('serverInfo ' + 'success ' + x[0].name + ' ' + x[0].status);
			});
			break;
		case 'delete':
			pm2.delete(appName, (err, x) => {
				if (err) return 'serverInfo', 'error', err;
				else 'serverInfo', 'success', x[0].name + ' ' + x[0].status;

				sendMsg('serverInfo ' + 'success ' + x[0].name + ' ' + x[0].status);
			});
			break;
		default:
			break;
	}
};

module.exports = PM2Control;
