"use strict";

define(function() {
	// REVIEW: To avoid long parameter list Consider the pattern
	// function System(settings) {
	//	 settings = settings || {};
	//   this.type = settings.type;
	//   this.interests = settings.interests || ....;
	//   this.isPassive = settings.isPassive || false;
	// }
	function System(type, interests, isPassive) {
		this.type = type;
		this.interests = interests;
		this.isPassive = isPassive || false;

		this._activeEntities = [];
	}

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

	// REVIEW: I don't understand what this is supposed to do. High prio for documentation?
	System.prototype._check = function(entity) {
		// REVIEW: Should there be a difference between interests is null and interests is an empty array?
		// REVIEW: This is supposed to be "!==" instead of "==="?
		var isInterested = this.interests === null;
		if (!isInterested && this.interests.length <= entity._components.length) {
			isInterested = true;
			for ( var i in this.interests) {
				var interest = this.interests[i];
				var found = false;
				// REVIEW: No need to loop over _components. Use entity[interest].
				for ( var j in entity._components) {
					var component = entity._components[j];
					if (component.type === interest) {
						found = true;
						break;
					}
				}

				if (!found) {
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

	System.prototype._process = function() {
		if (this.process) {
			this.process(this._activeEntities);
		}
	};

	return System;
});