define([
	'goo/entities/systems/System'
], function (
	System
) {
	'use strict';

	/**
	 * @extends System
	 */
	function ParticleSystem() {
		System.call(this, 'ParticleSystem', ['ParticleComponent', 'TransformComponent']);
		this.priority = 1;
	}
	ParticleSystem.prototype = Object.create(System.prototype);
	ParticleSystem.prototype.constructor = ParticleSystem;

	/**
	 * @private
	 * @param {array} entities
	 */
	ParticleSystem.prototype.process = function (entities, tpf) {
		for (var i = 0; i < entities.length; i++) {
			entities[i].particleComponent.process(tpf);
		}
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	ParticleSystem.prototype.inserted = function (/*entity*/) {};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	ParticleSystem.prototype.deleted = function (/*entity*/) {};

	/**
	 * @private
	 * @param  {Entity} entity
	 * @param  {Component} component
	 */
	ParticleSystem.prototype.removedComponent = function (/*entity, component*/) {};

	ParticleSystem.prototype.pause = function () {
		this.passive = true;
		var entities = this._activeEntities;
		for (var i = 0; i < entities.length; i++) {
			entities[i].particleComponent.pause();
		}
	};

	ParticleSystem.prototype.resume = function () {
		this.passive = false;
		var entities = this._activeEntities;
		for (var i = 0; i < entities.length; i++) {
			entities[i].particleComponent.resume();
		}
	};

	ParticleSystem.prototype.play = ParticleSystem.prototype.resume;

	ParticleSystem.prototype.stop = function () {
		this.pause();
		var entities = this._activeEntities;
		for (var i = 0; i < entities.length; i++) {
			entities[i].particleComponent.stop();
		}
	};

	return ParticleSystem;
});