module.exports = {
	SoundManager2Component: require('./components/SoundManager2Component'),
	SoundManager2System: require('./systems/SoundManager2System')
};

if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}