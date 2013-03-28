define([
	'goo/lib/soundmanager2/soundmanager2',
	'goo/entities/systems/System'
],
/** @lends SoundManager2System */
function(
	undefined,
	System
) {
	"use strict";

	var soundManager = window.soundManager;

	/**
	 * @class Handles integration with Sound Manager 2
	 */
	function SoundManager2System(settings) {
		System.call(this, 'SoundManager2System', ['SoundManager2Component', 'TransformComponent']);

		settings = settings || {};

		this.isReady = false;

		soundManager.bind(this).setup({
			url: 'swf',
			onready: function() {
				this.isRead = true;
			},
			ontimeout: function() {
				console.warn('Failed to load soundmanager');
			}
		});
	}

	SoundManager2System.prototype = Object.create(System.prototype);

	SoundManager2System.prototype.inserted = function(entity) {
		var soundManagerComponent = entity.soundManager2Component;
		var transformComponent = entity.transformComponent;

	};

	SoundManager2System.prototype.deleted = function(entity) {
		var soundManagerComponent = entity.soundManager2Component;

		// if (soundManagerComponent) {
			// this.world.remove(cannonComponent.body);
		// }
	};

	SoundManager2System.prototype.process = function(entities /*, tpf */) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var soundManagerComponent = entity.soundManager2Component;

		}
	};

	return SoundManager2System;
});