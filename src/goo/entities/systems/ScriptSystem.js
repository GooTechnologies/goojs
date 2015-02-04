define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/scripts/Scripts'
], function (
	System,
	SystemBus,
	Scripts
) {
	'use strict';

	/**
	 * Processes all entities with script components, running the scripts where applicable
	 * @extends System
	 */
	function ScriptSystem_(world) {
		System.call(this, 'ScriptSystem', ['ScriptComponent']);

		//! AT: why this?
		this._world = world;

		var renderer = this._world.gooRunner.renderer;
		// General world environment
		this.context = {
			domElement: renderer.domElement,
			viewportWidth: renderer.viewportWidth,
			viewportHeight: renderer.viewportHeight,
			world: world,
			activeCameraEntity: null,
			worldData: {}
		};

		SystemBus.addListener('goo.setCurrentCamera', function (data) {
			this.context.activeCameraEntity = data.entity;
		}.bind(this));

		SystemBus.addListener('goo.viewportResize', function (data) {
			this.context.viewportWidth = data.width;
			this.context.viewportHeight = data.height;
		}.bind(this));

		this.manualSetup = false;

		this.priority = 500;
	}

	var ScriptSystem = ScriptSystem_;

	ScriptSystem.prototype = Object.create(System.prototype);
	ScriptSystem.prototype.constructor = ScriptSystem;

	/*
	ScriptSystem.prototype.inserted = function (entity) {
		if (!this.manualSetup) {
			entity.scriptComponent.setup(entity);
		}
	};*/

	ScriptSystem.prototype.process = function (entities, tpf) {
		// Update scripts
		for (var i = 0; i < entities.length; i++) {
			var scriptComponent = entities[i].scriptComponent;
			scriptComponent.run(entities[i], tpf);
		}
	};

	ScriptSystem.prototype.addedComponent = function (entity, component) {
		if (component.type === 'ScriptComponent' && !this.manualSetup) {
			component.setup(entity);
		}
	};

	ScriptSystem.prototype.removedComponent = function (entity, component) {
		if (component.type === 'ScriptComponent' && !this.manualSetup) {
			component.cleanup();
		}
	};

	/*
	ScriptSystem.prototype.deleted = function (entity) {
		if (entity.scriptComponent && !this.manualSetup) {
			entity.scriptComponent.cleanup();
		}
	};*/

	ScriptSystem.prototype.clear = function () {
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];
			entity.scriptComponent.cleanup();
		}

		this._world = null;
		this.context = null;

		System.prototype.clear.call(this);
	};

	Scripts.addClass('ScriptSystem', ScriptSystem);

	return ScriptSystem;
});