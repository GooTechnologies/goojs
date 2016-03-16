import Component from '../../entities/components/Component';



	/* global CANNON */

	/**
	 * Terrain collider. Attach to an entity with a {@link CannonRigidbodyComponent}.
	 * @param {Object} [settings]
	 * @param {Object} [settings.data]
	 * @param {Object} [settings.shapeOptions]
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

	export default CannonTerrainColliderComponent;
