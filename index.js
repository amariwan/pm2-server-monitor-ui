const { spawn } = require('child_process');
const ps = require('ps-node');
const pm2 = require('pm2');
const path = require('path');
const fs = require('fs');
const { checkJsonFile } = require('./modules/createJsonFile');

/**
 * Initialize monitor module
 *
 * @param {Object} options - Options
 * @param {String} options.name - Server Name
 * @param {Number} options.port - Server Port Number
 * @example
 * monitor({
 *                  name: 'server001',
 *                  port: 3001
 * });
 */

const moment = require('moment');
const { Console } = require('console');
function getTime(time) {
	return moment().format('YYYY-MM-DD HH:mm:ss');
}

function line(num = 2) {
	const e = new Error();
	const regex = /\((.*):(\d+):(\d+)\)$/;
	const match = regex.exec(e.stack.split('\n')[num]);
	const filepath = match[1];
	const fileName = path.basename(filepath);
	const line = match[2];
	const column = match[3];
	return {
		filepath,
		fileName,
		line,
		column,
		str: `${getTime()} - ${fileName}:${line}:${column}`
	};
}

const index = async (config, callback = () => {}) => {
	const configPath = path.join(__dirname, '../.config/config.json');
	var config_data = await checkJsonFile(config, configPath);
	if (!config_data) {
		process.exit();
	}
	web_configPath = path.join(__dirname, '../UI/config_test.js');

	var web_configData = 'const servers = ' + JSON.stringify(config.web_config);

	// console.log(web_configData);

	const web_config = await checkJsonFile(web_configData.toString(), web_configPath);
	if (!web_config) {
		process.exit();
	}

	const name = config_data.name;
	const port = config_data.port;
	callback({ data: 'test1 ', name, port });
	if (!port) {
		console.error('pm2-server-monitor requires port!');
		process.exit();
	}
	callback('test2 ');
	if (!name) {
		console.error('pm2-server-monitor requires name!');
		process.exit();
	}

	callback('test3 ');
	// First find out if the god process exists, if not, continue to create
	ps.lookup(
		{
			command: 'node',
			arguments: [ '--monitport', port, '--monitname', name ]
		},
		(err, resultList) => {
			if (err) {
				return console.error(err);
			}

			callback(resultList);
			if (resultList && Array.isArray(resultList) && resultList.length > 0) {
				// Indicates that there is a god process
				console.log(`God process (pid ${resultList[0].pid}) already exists, continue to be used.`);
				callback(`God process (pid ${resultList[0].pid}) already exists, continue to be used.`);
				console.log(process.pid);
				process.kill(resultList[0].pid);
			} else {
				const currentPid = process.pid;
				callback(currentPid);
				pm2.list((err, data) => {
					callback('err', err);
					if (err) {
						return console.error(err);
					}
					callback(data);
					if (data && Array.isArray(data) && data.length > 0) {
						// According to the pid of the current process, find out the information that pm2 created the process
						// const currentProcess = data.find((process) => {
						// 	callback(process.pid);
						// 	return process.pid === currentPid;
						// });
						const currentProcess = true;
						// console.log(process.pid === currentPid);
						callback(currentProcess);
						if (currentProcess) {
							// Based on the fact: the same project execution script must be the same, and the process of executing the same script must also be the same project
							// const execPath = currentProcess.pm2_env.pm_exec_path;
							const execPath = currentProcess;
							const projectProcesses = data.filter(
								(process) => process.pm2_env.pm_exec_path === execPath
							);
							// if (projectProcesses[0].pid === currentPid) {
							// 	// The current process is the first process among all processes of the same project created by pm2 before spawning to ensure that there is only 1 god process even in cluster mode
							// 	callback(execPath);

							// 	return spawnGod(execPath, callback);
							// }
							return spawnGod(execPath, callback);
						}
					} else {
						const currentProcess = true;
						console.error('please restart the pm2 server ');
						return spawnGod(currentProcess, callback);
					}
				});
			}
		}
	);

	function spawnGod(execPath, callback = () => {}) {
		console.log('God process does not exist, will create the process!');
		const godScript = path.join(__dirname, './app.js');

		// --monitport is actually a special identifier that is easy to find the process
		const god = spawn('node', [ godScript, '--monitport', port, '--monitname', name, execPath ], {
			slient: true,
			detached: true
			// stdio: 'ignore'
		});
		callback(`God process was successfully created! pid ${god.pid}.`);
		console.log(`God process was successfully created! pid ${god.pid}.`);
		god.unref();

		god.on('message', (msg) => {
			callback('Message from parent:', msg);
		});

		god.on('exit', function(code, signal) {
			callback('child process exited with ' + `code ${code} and signal ${signal}`);
		});

		god.stdout.on('data', (data) => {
			console.log(data.toString());
			callback(data.toString());
		});
		god.stderr.on('data', (data) => {
			console.log(data.toString());
			callback(data.toString());
		});
	}
};
module.exports = index;
