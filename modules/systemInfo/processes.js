'use strict';

const si = require('systeminformation');
// si.processes().then((data) => console.log(data));
// si.currentLoad().then((data) => console.log(data)).catch((error) => console.error(error));

// module.exports =
setInterval(function() {
	si.currentLoad().then((data) => {
		si.processLoad('*').then((data) => console.log(data));
		// 		console.log(data);
	});
}, 1000);
