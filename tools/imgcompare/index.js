var exec = require('child_process').exec

// Wraps the command line tool
exports.compare = function(pathA,pathB,options,callback){
	var settings = {
		maxDist : 0,
		maxSumSquares : 0,
	};
	for(var key in options){
		if(typeof settings[key] != 'undefined'){
			settings[key] = options[key];
		}
	}

	var executable = __dirname + "/bin/imgcompare";
	var args = [pathA,pathB,settings.maxDist,settings.maxSumSquares];
	var cmd = executable + ' ' + args.join(' ');

	exec(cmd, function(err,stdout,stderr){
		if(err && err.code == 1){
			return callback && callback(null,false,stdout,stderr);
		} else if(err)
			return callback && callback(err);

		if(callback) callback(null,true,stdout,stderr);
	});
};
