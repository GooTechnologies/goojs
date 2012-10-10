define(function() {
	function Entity(world) {
		this._world = world;
		this._components = {};

		Object.defineProperty(this, 'id', {
			value : Entity.ENTITY_COUNT++,
			writable : false
		});
		this.name = 'Entity_' + this.id;
	}

	Entity.prototype.addToWorld = function() {
		this._world.addEntity(this);
	};

	Entity.prototype.removeFromWorld = function() {
		this._world.removeEntity(this);
	};

	Entity.prototype.setComponent = function(component) {
		this._components[component.type] = component;
	};

	Entity.prototype.clearComponent = function(component) {
		delete this._components[component.type];
	};

	Entity.ENTITY_COUNT = 0;

	return Entity;
});