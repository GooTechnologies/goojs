define([
	'goo/entities/components/Component'
], function (
	Component
) {
	'use strict';

	/* global CANNON */

	/**
	 * Terrain collider. Attach to an entity with a {@link CannonRigidbodyComponent}.
	 * @param {object} [settings]
	 * @param {object} [settings.data]
	 * @param {object} [settings.shapeOptions]
	 */
	function CannonTerrainColliderComponent(settings) {
		Component.apply(this, arguments);

		this.type = 'CannonTerrainColliderComponent';

		settings = settings || {
			data: [],
			shapeOptions: {}
		};

		// Create shape
		this.cannonShape = new CANNON.Heightfield(settings.data, settings.shapeOptions);
	}

	CannonTerrainColliderComponent.prototype = Object.create(Component.prototype);
	CannonTerrainColliderComponent.constructor = CannonTerrainColliderComponent;

	return CannonTerrainColliderComponent;
});
