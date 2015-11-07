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
	ParticleSystem.prototype.process = function (entities) {
		for (var i = 0; i < entities.length; i++) {
			entities[i].particleComponent.process();
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

	return ParticleSystem;
});