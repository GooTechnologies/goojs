module.exports = {
	FlatWaterRenderer: require('./FlatWaterRenderer'),
	ProjectedGrid: require('./ProjectedGrid'),
	ProjectedGridWaterRenderer: require('./ProjectedGridWaterRenderer')
};
if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}