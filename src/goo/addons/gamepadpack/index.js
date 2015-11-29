module.exports = {
	GamepadComponent: require('./GamepadComponent'),
	GamepadData: require('./GamepadData'),
	GamepadSystem: require('./GamepadSystem')
};
if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}