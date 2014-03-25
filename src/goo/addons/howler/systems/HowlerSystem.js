define([
	'goo/entities/systems/System',
	'goo/math/Vector3',
	'goo/renderer/Renderer'
],
/** @lends */
function(
	System,
	Vector3,
	Renderer
) {
	"use strict";

	/**
	 * @class Handles integration with Howler
	 * @desc Depends on the global Howler object.
	 * Load howler with a script tag before using this system.
	 * @extends System
	 */
	function HowlerSystem(settings) {
		System.call(this, 'HowlerSystem', ['HowlerComponent']);

		this.settings = settings || {};
		this.settings.scale = this.settings.scale || 0.1;
		this.entities = [];
	}

	HowlerSystem.prototype = Object.create(System.prototype);

	HowlerSystem.prototype.deleted = function(entity) {
		var howlerComponent = entity.howlerComponent;
		if (howlerComponent && howlerComponent.sounds) {
			var sounds = howlerComponent.sounds;
			for (var i = 0; i < sounds.length; i++) {
				sounds[i].stop();
			}
		}
	};

	HowlerSystem.prototype.process = function(entities) {
		this.entities = entities;
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var howlerComponent = entity.howlerComponent;
			var sounds = howlerComponent.sounds;

			var entityWorldTranslation = new Vector3();
			entityWorldTranslation.copy(entity.transformComponent.transform.translation);

			if (Renderer.mainCamera) {
				var soundTranslation = Renderer.mainCamera.getViewMatrix().applyPostPoint(entityWorldTranslation);
				for (var j = 0; j < sounds.length; j++) {
					sounds[j].pos3d(
						soundTranslation.data[0] * this.settings.scale,
						soundTranslation.data[1] * this.settings.scale,
						soundTranslation.data[2] * this.settings.scale
					);
				}
			}
		}
	};

	return HowlerSystem;
});