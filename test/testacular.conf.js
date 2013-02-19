// Testacular configuration
// Generated on Tue Dec 11 2012 12:19:21 GMT+0100 (CET)


// base path, that will be used to resolve files and exclude
basePath = '..';


// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  REQUIRE,
  REQUIRE_ADAPTER,
  'test/testacular-main.js',
  {pattern: 'test/**/*.js', included: false},
  {pattern: 'src/goo/**/*.js', included: false},
  {pattern: 'lib/**/*.js', included: false}
];


// list of files to exclude
exclude = [];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['dots', 'junit', 'coverage'];

junitReporter = {
  // will be resolved to basePath (in the same way as files/exclude patterns)
  outputFile: 'test-out/test-results.xml'
};

// Coverage reporter configuration
coverageReporter = {
  type : ['lcov'],
  dir : 'test-out/coverage/'
}


// web server port
port = 8080;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 10000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;


// Run preprocessors such as code covarage instrumentation
preprocessors = {
  '**/src/goo/**/*.js': 'coverage'
//  '**/*.coffee': 'coffee'
};

