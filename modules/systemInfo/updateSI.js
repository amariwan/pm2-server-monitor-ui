var si = require('systeminformation');
var ip = require('ip');

function updateSi() {
	// Gather params
	var systemMonitor = {};
	var sysInfo = { cpu: 0, mem: 0, temp: 0 };

	si.currentLoad(function(data) {
		sysInfo.cpu = data.currentload;
		si.mem(function(data) {
			console.log(data.toPrecision(3).toString() + ' %');
			sysInfo.mem = data.active / data.total * 100;

			si.cpuTemperature(function(data) {
				sysInfo.temp = data.main;

				// systemMonitor.system.cpu = sysInfo.cpu.toPrecision(3).toString() + ' %';
				// systemMonitor.system.mem = sysInfo.mem.toPrecision(2).toString() + ' %';
				// systemMonitor.system.temp = sysInfo.temp.toPrecision(3).toString() + ' °C';
				// systemMonitor.system.ip = ip.address();
			});
		});
	});
	console.log(systemMonitor);
}

// Schedule update
setInterval(updateSi, 500);
