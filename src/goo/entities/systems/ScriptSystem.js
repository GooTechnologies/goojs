define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/util/ObjectUtil'
],
	/** @lends */
	function (
		System,
		SystemBus,
		_
	) {
	'use strict';

	/**
	 * @class Processes all entities with script components, running the scripts where applicable
	 */
	function ScriptSystem(world) {
		System.call(this, 'ScriptSystem', ['ScriptComponent']);
		this._world = world;
		var renderer = this._world.gooRunner.renderer;
		// General world environment
		this.environment = {
			domElement: renderer.domElement,
			viewportWidth: renderer.viewportWidth,
			viewportHeight: renderer.viewportHeight,
			world: world,
			SystemBus: SystemBus,
			activeCameraEntity: null
		};
		SystemBus.addListener('goo.setCurrentCamera', function(data) {
			this.environment.activeCameraEntity = data.entity;
		}.bind(this));
		this.manualSetup = false;

		this.priority = 500;
	}

	ScriptSystem.prototype = Object.create(System.prototype);

	ScriptSystem.prototype.inserted = function (entity) {
		if (!this.manualSetup) {
			entity.scriptComponent.setup(entity);
		}
	};

	ScriptSystem.prototype.process = function (entities, tpf) {
		// Update environment
		var renderer = this._world.gooRunner.renderer;
		_.extend(this.environment, {
			viewportWidth: renderer.viewportWidth,
			viewportHeight: renderer.viewportHeight
		});

		// Update scripts
		for (var i = 0; i < entities.length; i++) {
			var scriptComponent = entities[i].scriptComponent;
			scriptComponent.run(entities[i], tpf, this.environment);
		}
	};

	ScriptSystem.prototype.deleted = function (entity) {
		if (entity.scriptComponent && !this.manualSetup) {
			entity.scriptComponent.cleanup();
		}
	};

	return ScriptSystem;
});