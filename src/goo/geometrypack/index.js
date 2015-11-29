module.exports = {
	FilledPolygon: require('./FilledPolygon'),
	PolyLine: require('./PolyLine'),
	RegularPolygon: require('./RegularPolygon'),
	Surface: require('./Surface'),
	TextComponent: require('./text/TextComponent'),
	TextComponentHandler: require('./text/TextComponentHandler'),
	TextMeshGenerator: require('./text/TextMeshGenerator'),
	Triangle: require('./Triangle')
};
if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}