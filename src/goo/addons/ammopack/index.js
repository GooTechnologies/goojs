module.exports = {
	AmmoComponent: require('./AmmoComponent'),
	AmmoSystem: require('./AmmoSystem'),
	calculateTriangleMeshShape: require('./calculateTriangleMeshShape')
};
if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}