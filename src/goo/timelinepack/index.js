module.exports = {
	AbstractTimelineChannel: require('./AbstractTimelineChannel'),
	EventChannel: require('./EventChannel'),
	TimelineComponent: require('./TimelineComponent'),
	TimelineComponentHandler: require('./TimelineComponentHandler'),
	TimelineSystem: require('./TimelineSystem'),
	ValueChannel: require('./ValueChannel')
};
if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}