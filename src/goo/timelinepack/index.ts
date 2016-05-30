import AbstractTimelineChannel = require('./AbstractTimelineChannel');
import EventChannel = require('./EventChannel');
import TimelineComponent = require('./TimelineComponent');
import TimelineComponentHandler = require('./TimelineComponentHandler');
import TimelineSystem = require('./TimelineSystem');
import ValueChannel = require('./ValueChannel');

var all = {
	AbstractTimelineChannel,
	EventChannel,
	TimelineComponent,
	TimelineComponentHandler,
	TimelineSystem,
	ValueChannel
};

if (typeof(window) !== 'undefined') {
	for (var key in all) {
		(<any>window).goo[key] = all[key];
	}
}