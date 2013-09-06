define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp',
	'goo/scripts/OrbitCamControlScript',
	'goo/scripts/OrbitNPanControlScript',
	'goo/scripts/WASDControlScript',
	'goo/scripts/BasicControlScript',
	'goo/util/PromiseUtil'
], function(
	ConfigHandler,
	RSVP,
	OrbitCamControlScript,
	OrbitNPanControlScript,
	WASDControlScript,
	BasicControlScript,
	PromiseUtil
) {
	function ScriptHandler() {
		ConfigHandler.apply(this, arguments);
	}
	ScriptHandler.scripts = {
		OrbitCamControlScript: OrbitCamControlScript,
		OrbitNPanControlScript: OrbitNPanControlScript,
		WASDControlScript: WASDControlScript,
		BasicControlScript: BasicControlScript
	};

	ScriptHandler.prototype = Object.create(ConfigHandler.prototype);
	ScriptHandler.prototype.constructor = ScriptHandler;
	ConfigHandler._registerClass('script', ScriptHandler);

	ScriptHandler.prototype._prepare = function(/*config*/) {};
	ScriptHandler.prototype._create = function(/*ref*/) {};

	ScriptHandler.prototype.update = function(ref, config) {
		var name = config.className;
		var script = null;
		if(ScriptHandler.scripts[name] instanceof Function) {
			script = new ScriptHandler.scripts[name](config.options);
		}
		return PromiseUtil.createDummyPromise(script);
	};
	return ScriptHandler;
});