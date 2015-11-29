module.exports = {
	DoubleQuad: require('./DoubleQuad'),
	QuadComponent: require('./QuadComponent'),
	QuadComponentHandler: require('./QuadComponentHandler')
};
if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}