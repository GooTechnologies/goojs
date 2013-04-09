define(
/** @lends */
function() {
	"use strict";

	/**
	 * Creates a new System
	 *
	 * @class Base class for all entity systems
	 *        <ul>
	 *        <li> interests = null -> listen to all entities
	 *        <li> interests = [] -> listen to entities with no components
	 *        <li> interests = ['coolComponent', 'testComponent'] -> listen to entities that contains at minimum 'coolComponent' and 'testComponent'
	 *        </ul>
	 * @param {String} type System type name as a string
	 * @param {String[]} interests Array of component types this system is interested in
	 * @property {String} type System type
	 * @property {String[]} interests Array of component types this system is interested in
	 */
	function System(type, interests) {
		this.type = type;
		this.interests = interests;

		this._activeEntities = [];
	}

	/**
	 * @param entity
	 */
	System.prototype.added = function(entity) {
		this._check(entity);
	};

	System.prototype.changed = function(entity) {
		this._check(entity);
	};

	System.prototype.removed = function(entity) {
		var index = this._activeEntities.indexOf(entity);
		if (index !== -1) {
			this._activeEntities.splice(index, 1);
			if (this.deleted) {
				this.deleted(entity);
			}
		}
	};

	function getTypeAttributeName(type) {
		return type.charAt(0).toLowerCase() + type.substr(1);
	}

	/**
	 * Check if a system is interested in an entity based on its interests list.
	 *
	 * @param entity {@link Entity} to check if the system is interested in
	 */
	System.prototype._check = function(entity) {
		var isInterested = this.interests === null;
		if (!isInterested && this.interests.length <= entity._components.length) {
			isInterested = true;
			for (var i = 0; i < this.interests.length; i++) {
				var interest = getTypeAttributeName(this.interests[i]);

				if (!entity[interest]) {
					isInterested = false;
					break;
				}
			}
		}

		var index = this._activeEntities.indexOf(entity);
		if (isInterested && index === -1) {
			this._activeEntities.push(entity);
			if (this.inserted) {
				this.inserted(entity);
			}
		} else if (!isInterested && index !== -1) {
			this._activeEntities.splice(index, 1);
			if (this.deleted) {
				this.deleted(entity);
			}
		}
	};

	System.prototype._process = function(tpf) {
		if (this.process) {
			this.process(this._activeEntities, tpf);
		}
	};

	return System;
});