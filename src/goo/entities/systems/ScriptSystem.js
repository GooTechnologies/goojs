var System = require('../../entities/systems/System');
var SystemBus = require('../../entities/SystemBus');

/**
 * Processes all entities with script components, running the scripts where applicable
 * @extends System
 */
function ScriptSystem() {
	System.call(this, 'ScriptSystem', ['ScriptComponent']);

	// General world environment
	this.context = {
		domElement: 0,
		viewportWidth: 0,
		viewportHeight: 0,
		world: null,
		activeCameraEntity: null,
		worldData: {},
		playTime: 0
	};

	SystemBus.addListener('goo.setCurrentCamera', function (data) {
		this.context.activeCameraEntity = data.entity;
	}.bind(this));

	SystemBus.addListener('goo.viewportResize', function (data) {
		this.context.viewportWidth = data.width;
		this.context.viewportHeight = data.height;
	}.bind(this));

	this.priority = 500;
}

ScriptSystem.prototype = Object.create(System.prototype);
ScriptSystem.prototype.constructor = ScriptSystem;

ScriptSystem.prototype.setup = function (world) {
	this.checkEntities(world);

	var context = this.context;
	var renderer = world.gooRunner.renderer;

	context.domElement = renderer.domElement;
	context.viewportWidth = renderer.viewportWidth;
	context.viewportHeight = renderer.viewportHeight;
	context.world = world;
	context.activeCameraEntity = null;
	context.worldData = {};
	context.playTime = 0;
};

ScriptSystem.prototype.inserted = function (entity) {
	if (this.world.playing) {
		entity.scriptComponent.setup(entity);
	} else {
		entity.scriptComponent.editModeSetup(entity);
	}
};

ScriptSystem.prototype.fixedUpdate = function (entities, fixedTpf) {
	// Update scripts
	for (var i = 0; i < entities.length; i++) {
		var scriptComponent = entities[i].scriptComponent;
		scriptComponent.fixedUpdate(entities[i], fixedTpf);
	}
};

ScriptSystem.prototype.process = function (entities, tpf) {
	if (this.world.playing) {
		this.context.playTime += tpf;

		// Update scripts
		for (var i = 0; i < entities.length; i++) {
			var scriptComponent = entities[i].scriptComponent;
			scriptComponent.process(entities[i], tpf);
		}
	}
};

ScriptSystem.prototype.lateProcess = function (entities, tpf) {
	for (var i = 0; i < entities.length; i++) {
		var scriptComponent = entities[i].scriptComponent;
		scriptComponent.lateProcess(entities[i], tpf);
	}
};

ScriptSystem.prototype.playModeChanged = function () {
	var entities = this._activeEntities;
	var context = this.context;

	if (this.world.playing) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			entity.scriptComponent.setup(entity);
		}
	} else {
		for (var i = 0; i < entities.length; i++) {
			entities[i].scriptComponent.cleanup();
		}

		// Clear worldData
		var worldData = context.worldData;
		var keys = Object.keys(worldData);
		for (var i = 0; i < keys.length; i++) {
			delete worldData[keys[i]];
		}
	}

	context.playTime = 0;
};

ScriptSystem.prototype.addedComponent = function (entity, component) {
	if (component.type === 'ScriptComponent' && this.world.playing) {
		component.setup(entity);
	}
};

ScriptSystem.prototype.removedComponent = function (entity, component) {
	if (component.type === 'ScriptComponent' && this.world.playing) {
		component.cleanup();
	}
};

ScriptSystem.prototype.deleted = function (entity) {
	if (entity.scriptComponent) {
		entity.scriptComponent.cleanup();
	}
};

ScriptSystem.prototype.clear = function () {
	for (var i = 0; i < this._activeEntities.length; i++) {
		var entity = this._activeEntities[i];
		entity.scriptComponent.cleanup();
	}

	this.context = null;

	System.prototype.clear.call(this);
};

module.exports = ScriptSystem;