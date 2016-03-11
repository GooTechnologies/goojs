module.exports = {
	BloomPass: require('./BloomPass'),
	BlurPass: require('./BlurPass'),
	DepthPass: require('./DepthPass'),
	DofPass: require('./DofPass'),
	DogPass: require('./DogPass'),
	index: require('./index'),
	MotionBlurPass: require('./MotionBlurPass'),
	PassLib: require('./PassLib'),
	PosteffectsHandler: require('./PosteffectsHandler'),
	ShaderLibExtra: require('./ShaderLibExtra'),
	SsaoPass: require('./SsaoPass')
};
if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}