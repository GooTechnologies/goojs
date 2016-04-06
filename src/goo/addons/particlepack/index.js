module.exports = {
	ParticleSystemComponent: require('./components/ParticleSystemComponent'),
	ConstantCurve: require('./curves/ConstantCurve'),
	Curve: require('./curves/Curve'),
	LerpCurve: require('./curves/LerpCurve'),
	LinearCurve: require('./curves/LinearCurve'),
	PolyCurve: require('./curves/PolyCurve'),
	Vector3Curve: require('./curves/Vector3Curve'),
	Vector4Curve: require('./curves/Vector4Curve'),
	ParticleSystemComponentHandler: require('./handlers/ParticleSystemComponentHandler'),
	ParticleData: require('./ParticleData'),
	ParticleDebugRenderSystem: require('./systems/ParticleDebugRenderSystem'),
	ParticleSystemSystem: require('./systems/ParticleSystemSystem')
};

if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}