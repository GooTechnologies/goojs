import Component from '../../entities/components/Component';

/**
 * @private
 */
function ProximityComponent(tag) {
	Component.apply(this, arguments);

	this.type = 'ProximityComponent';

	Object.defineProperty(this, 'tag', {
		value: tag || 'red',
		writable: false
	});
}

ProximityComponent.prototype = Object.create(Component.prototype);
ProximityComponent.prototype.constructor = ProximityComponent;

ProximityComponent.prototype.attached = function (entity) {
	var world = entity._world;
	if (!world) { return; }

	var proximitySystem = world.getSystem('ProximitySystem');
	if (!proximitySystem) { return; }

	proximitySystem.add(entity, this.tag);
};

ProximityComponent.prototype.detached = function (entity) {
	var world = entity._world;
	if (!world) { return; }

	var proximitySystem = world.getSystem('ProximitySystem');
	if (!proximitySystem) { return; }

	proximitySystem.remove(entity, this.tag);
};

export default ProximityComponent;