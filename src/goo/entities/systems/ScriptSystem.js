define(['goo/entities/systems/System'],
	/** @lends */
	function (System) {
	"use strict";

	/**
	 * @class Processes all entities with script components, running the scripts where applicable
	 */
	function ScriptSystem(renderer) {
		System.call(this, 'ScriptSystem', ['ScriptComponent']);
		this.renderer = renderer;
		this.environment = {
			domElement: this.renderer.domElement,
			viewportWidth: this.renderer.viewportWidth,
			viewportHeight: this.renderer.viewportHeight
		};
		this.manualSetup = false;

		this.priority = 500;
	}

	ScriptSystem.prototype = Object.create(System.prototype);

	ScriptSystem.prototype.inserted = function (entity) {
		if (!this.manualSetup) {
			entity.scriptComponent.setup(entity, this.environment);
		}
	};

	ScriptSystem.prototype.process = function (entities, tpf) {
		this.environment.domElement = this.renderer.domElement;
		this.environment.viewportWidth = this.renderer.viewportWidth;
		this.environment.viewportHeight = this.renderer.viewportHeight;

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