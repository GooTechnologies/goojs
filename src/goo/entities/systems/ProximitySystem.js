define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus'
],
/** @lends */
function (
	System,
	SystemBus
) {
	'use strict';

	/**
	 * @class Processes all entities with a proximity component
	 * @param {Renderer} renderer
	 * @param {RenderSystem} renderSystem
	 */
	function ProximitySystem() {
		System.call(this, 'ProximitySystem', ['ProximityComponent']);

		this.collections = {
			red: { name: 'red', collection: [] },
			blue: { name: 'blue', collection: [] },
			green: { name: 'green', collection: [] },
			yellow: { name: 'yellow', collection: [] }
		};
	}

	ProximitySystem.prototype = Object.create(System.prototype);

	ProximitySystem.prototype._collides = function (first, second) {
		// really non-optimal
		for (var i = 0; i < first.collection.length; i++) {
			var firstElement = first.collection[i];
			for (var j = 0; j < second.collection.length; j++) {
				var secondElement = second.collection[j];

				if (firstElement.meshRendererComponent.worldBound.intersects(secondElement.meshRendererComponent.worldBound)) {
					SystemBus.send('collides.blue.' + first.name + '.' + second.name);
				}
			}
		}
	};

	ProximitySystem.prototype.getFor = function (tag) {
		return this.collections[tag].collection;
	};

	ProximitySystem.prototype.inserted = function (entity) {
		this.collections[entity.proximityComponent.tag].collection.push(entity);
	};

	ProximitySystem.prototype.deleted = function (entity) {
		var collection = this.collections[entity.proximityComponent.tag];
		var index = collection.indexOf(entity);
		collection.splice(index, 1);
	};

	ProximitySystem.prototype.process = function (/*entities*/) {
		/*
		this._collides(this.collections.red, this.collections.blue);
		this._collides(this.collections.red, this.collections.green);
		this._collides(this.collections.red, this.collections.yellow);

		this._collides(this.collections.blue, this.collections.green);
		this._collides(this.collections.blue, this.collections.yellow);

		this._collides(this.collections.green, this.collections.yellow);
		*/
	};

	return ProximitySystem;
});