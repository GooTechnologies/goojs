module.exports = {
	Box2DComponent: require('./components/Box2DComponent'),
	Box2DSystem: require('./systems/Box2DSystem')
};
if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}