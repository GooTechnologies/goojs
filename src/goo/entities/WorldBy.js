define([
	'goo/entities/EntitySelection'
], function (
	EntitySelection
) {
	'use strict';

	/**
	 * @class
	 * @class
	 * @param {World} world
	 */
	function WorldBy(world) {

		this.system = function (systemType) {
			var system = world.getSystem(systemType);
			return new EntitySelection(system._activeEntities);
		};

		this.component = function (componentType) {
			var entities = world.entityManager.getEntities();

			return new EntitySelection(entities.filter(function (entity) {
				return entity.hasComponent(componentType);
			}));
		};

		this.tag = function (tag) {
			var entities = world.entityManager.getEntities();

			return new EntitySelection(entities.filter(function (entity) {
				return entity.hasTag(tag);
			}));
		};

		this.attribute = function (attribute) {
			var entities = world.entityManager.getEntities();

			return new EntitySelection(entities.filter(function (entity) {
				return entity.hasAttribute(attribute);
			}));
		};
	}

	return WorldBy;
});