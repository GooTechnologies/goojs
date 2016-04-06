module.exports = {
	P2Component: require('./P2Component'),
	P2System: require('./P2System')
};

if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}