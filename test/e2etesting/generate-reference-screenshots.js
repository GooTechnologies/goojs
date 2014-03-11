var webdriver = require('selenium-webdriver')
,	fs = require('fs')
,	os = require('os')
,	path = require('path')
,   program = require('commander')
,   async = require('async')
,   coffeescript = require('coffee-script')
,   toc = require(__dirname + '/../../visual-test/toc')
,   mkdirp = require('mkdirp')

program
  .version('0.0.0')
  .option('-u, --url [url]', 'URL of the visual test folder')
  .option('-w, --wait [milliseconds]', 'Number of milliseconds to wait for the test to run before taking a screenshot.')
  .parse(process.argv);

program.url = program.url || 'http://localhost:3000/visual-tests';
program.wait = program.wait || 0;


var script = [	"var statsEl = document.getElementById('stats');", // Remove stats box
				"if(statsEl) statsEl.style.display='none';",
				"var logoEl = document.getElementById('goologo');", // Remove logo
				"if(logoEl) logoEl.style.display='none';",
				"var dgEls = document.getElementsByClassName('dg ac');", // Remove dat gui
				"if(dgEls && dgEls.length) dgEls[0].style.display='none';",
			].join('\n');

// Get all demo files
toc.getFiles(function(err,files){
	if(err) throw err;

	var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

	// Loop asynchronously over all files
	async.eachSeries(files, function(file,done){

		file = file.replace('visual-test/','');
		basename = path.basename(file);
		dirname = path.dirname(file);

		// Point the browser to it
		driver.get(program.url+"/"+file).then(function(){

			// Print URL
			console.log(program.url+"/"+file)

			// Get the window and resize it
			var w = new webdriver.WebDriver.Window(driver);
			w.setSize(500,500).then(function(){

				// Wait for webgl to set up and so on
				setTimeout(function(){

					// Run our startup script
					driver.executeScript(script).then(function() {

						// Wait for webgl to set up and so on
						setTimeout(function(){

							// Take screenshot
							var p = driver.takeScreenshot().then(function(data) {

								var screenshotsPath = path.join(__dirname,'screenshots');
								var pngPath = path.join(screenshotsPath,dirname,basename.replace("html","png"));

								// Create out folder if it does not exist
								mkdirp.mkdirp(path.dirname(pngPath),function(err){
									if(err) throw err;

									// Save screenshot
									fs.writeFileSync(pngPath, data, 'base64');
									done();
								});
							});
						},program.wait);
					});
				},program.wait);
			});
		});

	},function(){

		// Shut down
		driver.close().then(function(){
			// ???
			// Profit.
		});
	});
});

