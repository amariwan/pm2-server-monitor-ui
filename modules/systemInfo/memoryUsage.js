'use strict';
const si = require('systeminformation');
const memoryUsage = async () => {
	return new Promise(async (resolve, reject) => {
		var data = await si.mem();
		resolve(Math.round(data * 100));
	});
};

module.exports = memoryUsage;
