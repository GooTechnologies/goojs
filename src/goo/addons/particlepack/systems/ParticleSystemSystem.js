define([
	'goo/entities/systems/System'
], function (
	System
) {
	'use strict';

	/**
	 * System that runs all the ParticleSystemComponents.
	 * @extends System
	 */
	function ParticleSystemSystem() {
		System.call(this, 'ParticleSystemSystem', ['ParticleSystemComponent', 'TransformComponent']);
		this.priority = 1;
	}
	ParticleSystemSystem.prototype = Object.create(System.prototype);
	ParticleSystemSystem.prototype.constructor = ParticleSystemSystem;

	/**
	 * @private
	 * @param {array} entities
	 */
	ParticleSystemSystem.prototype.process = function (entities, tpf) {
		for (var i = 0; i < entities.length; i++) {
			entities[i].particleSystemComponent.process(tpf);
		}
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	ParticleSystemSystem.prototype.inserted = function (/*entity*/) {};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	ParticleSystemSystem.prototype.deleted = function (/*entity*/) {};

	/**
	 * @private
	 * @param  {Entity} entity
	 * @param  {Component} component
	 */
	ParticleSystemSystem.prototype.removedComponent = function (/*entity, component*/) {};
	
	/**
	 * Pause all ParticleSystemComponents.
	 */
	ParticleSystemSystem.prototype.pause = function () {
		var entities = this._activeEntities;
		for (var i = 0; i < entities.length; i++) {
			entities[i].particleSystemComponent.pause();
		}
	};

	/**
	 * Resume all ParticleSystemComponents.
	 */
	ParticleSystemSystem.prototype.resume = function () {
		var entities = this._activeEntities;
		for (var i = 0; i < entities.length; i++) {
			entities[i].particleSystemComponent.resume();
		}
	};

	/**
	 * Play all ParticleSystemComponents.
	 */
	ParticleSystemSystem.prototype.play = function(){
		var entities = this._activeEntities;
		for (var i = 0; i < entities.length; i++) {
			var component = entities[i].particleSystemComponent;
			if(component.autoPlay){
				component.play();
			}
		}
	};

	ParticleSystemSystem.prototype.stop = function () {
		this.pause();
		var entities = this._activeEntities;
		for (var i = 0; i < entities.length; i++) {
			entities[i].particleSystemComponent.stop();
		}
	};

	return ParticleSystemSystem;
});