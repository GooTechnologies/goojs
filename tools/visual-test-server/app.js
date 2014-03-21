var path = require('path');
var runner = require(path.join(__dirname,'..','..','node_modules','jasmine-node'));
var program = require('commander');
var jasmineEnv = require(path.join(__dirname,'..','..','node_modules','jasmine-node','lib','jasmine-node','jasmine-loader'))
var fileFinder = require(path.join(__dirname,'..','..','node_modules','jasmine-node','lib','jasmine-node','file-finder'))
var Reporter = require('./Reporter')
var jasmine = jasmineEnv.getEnv();
var express = require('express');
var http = require('http');
var _ = require('underscore')
var glob = require('glob')

// Specs to present
var specs = [];

program
  .version('0.0.1')
  .usage('[options] <specFiles ...>')
  .option('-p, --port', 'Server port')
  .parse(process.argv);

// Get default options
var options = JSON.parse(JSON.stringify(runner.defaults));
for(var i=0; i<program.args.length; i++){
	options.specFolders.push(program.args[i]);
}

// Create custom reporter
var reporter;
function onComplete(){
	specs.length = 0;
	for(var specId in reporter.allSpecs){
		var spec = reporter.allSpecs[specId];
		specs.push(spec);
	}
};
options.onComplete = onComplete;
reporter = new Reporter(options);
jasmine.addReporter(reporter);

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
var screenshotsPath = path.join(__dirname, '..', '..', 'test', 'e2etesting', 'screenshots');
var refScreenshotsPath = path.join(__dirname, '..', '..', 'test', 'e2etesting', 'screenshots-tmp');
var screenShotsURL = '/screenshots';
var refScreenShotsURL = '/reference-screenshots';
app.use(screenShotsURL, express.directory(screenshotsPath));
app.use(screenShotsURL, express.static(screenshotsPath));
app.use(refScreenShotsURL, express.directory(refScreenshotsPath));
app.use(refScreenShotsURL, express.static(refScreenshotsPath));
app.use(express.errorHandler());

app.get('/', function(req,res){

	var compare = {};
	var refPngs = glob(screenshotsPath+'/**/*.png',function(err,pngs){
		for(var i=0; i<pngs.length; i++){
			var p = screenShotsURL +'/' + path.relative(screenshotsPath,pngs[i]);
			var p2 = refScreenShotsURL + '/' + path.relative(refScreenshotsPath,pngs[i].replace('screenshots','screenshots-tmp'));
			compare[p] = p2;
		}

		res.status(200).send({
			lastRunTime: reporter.jasmineDoneAt,
			specs: specs,
			referenceScreenshotsURL: refScreenShotsURL,
			screenShotsURL: screenShotsURL,
			compare: compare
		});
	});

	// Get default options
	var options = JSON.parse(JSON.stringify(runner.defaults));
	options.specFolders.push(path.join(__dirname,'..','..','test','e2etesting','specs'));
	console.log(options.specFolders)
	options.onComplete = onComplete;

	// Run!
	if(reporter.done){
		reporter.config = options;
		//runner.run(options);

		var defaults, funcName, jasFunc, jasmine, matchedSpecs, reporterOptions, spec, specsList, _i, _len;
	    defaults = {
	      regExpSpec: new RegExp(".(js)$", "i")
	    };
	    reporterOptions = _.defaults(options, defaults);
	    jasmine = jasmineEnv.getEnv();
	    for (funcName in jasmine) {
	      jasFunc = jasmine[funcName];
	      global[funcName] = jasFunc;
	    }
	    global.dontShutDownShooter = true;
	    matchedSpecs = fileFinder.find(options.specFolders, options.regExpSpec);
	    specsList = fileFinder.sortFiles(matchedSpecs);
	    if (_.isEmpty(specsList)) {
	      console.error("\nNo Specs Matching found");
	    }
	    for (var i = 0, _len = specsList.length; i < _len; i++) {
	      var spec = specsList[i];
	      try {
	        require(spec.path().replace(/\.\w+$/, ""));
	      } catch (error) {
	        console.log("Exception loading: " + (spec.path()));
	        console.log(error);
	        throw error;
	      }
	    }
	    jasmine.execute();
	}
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
