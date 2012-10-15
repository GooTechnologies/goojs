define(function() {
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
		if (index != -1) {
			this._activeEntities.splice(index, 1);
		}
	};

	System.prototype._check = function(entity) {
		var isInterested = this.interests == null;
		if (!isInterested && this.interests.length <= entity._components.length) {
			isInterested = true;
			for (i in this.interests) {
				var interest = this.interests[i];
				var found = false;
				for (j in entity._components) {
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
		if (isInterested && index == -1) {
			this._activeEntities.push(entity);
			if (this.inserted) {
				this.inserted(entity);
			}
		} else if (!isInterested && index != -1) {
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