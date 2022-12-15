'use strict';
const si = require('systeminformation');
const memoryUsage = async () => {
	return new Promise(async (resolve, reject) => {
		var data = await si.mem();
		resolve((data.used/data.total)*100))
	});
};

module.exports = memoryString;
