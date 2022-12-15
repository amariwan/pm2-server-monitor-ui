var si = require('systeminformation');
var ip = require('ip');

function updateSi() {
	// Gather params

	var sysInfo = { cpu: 0, mem: 0, temp: 0 };

	si.currentLoad(function(data) {
		sysInfo.cpu = data.currentload;

		si.mem(function(data) {
			sysInfo.mem = data.active / data.total * 100;

			si.cpuTemperature(function(data) {
				sysInfo.temp = data.main;

				sysInfo.cpu.toPrecision(3).toString() + ' %';
				sysInfo.mem.toPrecision(2).toString() + ' %';
				sysInfo.temp.toPrecision(3).toString() + ' °C';
				sysInfo.ip = ip.address();
			});
		});
	});
	console.log(sysInfo);
}

// Schedule update
setInterval(updateSi, 500);
