var exec = require('child_process').exec,
	child;
child = exec('ping -c 1 128.39.36.96', function(error, stdout, stderr) {
	if (error !== null) console.log('Not available');
	else console.log('Available');
});
