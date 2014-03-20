var _ = require('underscore');
var util = require('util');

function Reporter(config) {
  var defaults;
  this.config = config != null ? config : {};
  var defaults = {
	onComplete: function(){},
  };
  this.config = _.defaults(this.config, defaults);
  this.reset();
  this.done = true;
  return;
}

Reporter.prototype.reset = function(){
	this.allSpecs = {};
	this.suiteTimes = {};
};

Reporter.prototype.jasmineStarted = function(runner) {
	this.startedAt = new Date();
	console.log("JASMINE STARTED")
};

Reporter.prototype.jasmineDone = function() {
	if (typeof (_base = this.config).onComplete === "function") {
		this.config.onComplete.apply(this);
	}
	this.done = true;
	console.log("JASMINE DONE")
};

Reporter.prototype.suiteStarted = function(suite) {
	this.suiteTimes[suite.id] = +(new Date);
	suite.parent = this.currentSuite;
	this.currentSuite = suite;
	this.reset();
	this.done = false;

	console.log("SUITE STARTED")
};

Reporter.prototype.suiteDone = function(suite) {
  var _ref;
  if (!this.suiteTimes[suite.id]) {
	return;
  }
  this.suiteTimes[suite.id] = (+(new Date)) - this.suiteTimes[suite.id];
  delete this.suiteTimes[suite.id];
  this.currentSuite = (_ref = this.currentSuite.parent) != null ? _ref : null;
  this.done = true;

  console.log("SUITE DONE")
};

Reporter.prototype.specStarted = function(spec) {
	this.specStart = new Date();
};

Reporter.prototype.specDone = function(spec) {
  var msg, _base, _name;
  ((_base = this.allSpecs)[_name = this.currentSuite.id] != null ? _base[_name] : _base[_name] = []).push(spec);

  switch (spec.status) {

	case 'pending':
	  break;

	case 'passed':
	  break;

	case 'failed':
	  break;

	default:
		break;
  }

  console.log(spec)
};

module.exports = Reporter;