module.exports = {
	LineRenderer: require('./LineRenderer'),
	LineRenderSystem: require('./LineRenderSystem')
};

if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}