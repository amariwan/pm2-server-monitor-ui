'use strict';
const si = require('systeminformation');
const memoryUsage = async () => {
	return new Promise(async (resolve, reject) => {
		var data = await si.mem();
		console.log(( data.used / data.total * 100).toString())
		resolve((data.used / data.total * 100).toString());
	});
};

module.exports = memoryUsage;
