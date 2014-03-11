
console.log("asdjnadfjn")

var webdriver = require('selenium-webdriver');

jasmine.getEnv().defaultTimeoutInterval = 10000; // in microseconds.

var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    build();

		console.log("asdff")


describe('basic test', function () {
	it('should be on correct page', function (done) {
		console.log("asd")

		var a = false;
		driver.get('http://www.wingify.com');
		driver.getTitle().then(function(title) {
			expect(title).toBe('Wingify');
			a = true;
		});


		/*
		waitsFor(function(){
			return a;
		},'asd',1000);


	    runs(function () {
	      expect(true).toBeTruthy();
	    });
*/
	});
});

