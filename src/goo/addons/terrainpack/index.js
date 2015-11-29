module.exports = {
	Forrest: require('./Forrest'),
	Terrain: require('./Terrain'),
	TerrainHandler: require('./TerrainHandler'),
	TerrainSurface: require('./TerrainSurface'),
	Vegetation: require('./Vegetation')
};
if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}