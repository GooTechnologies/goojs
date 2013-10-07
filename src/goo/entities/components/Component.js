define(
	/** @lends */
	function () {
	"use strict";

	/**
	 * @class Base class/module for all components
	 * @param {String} componentType Component type
	 * @param {Boolean} allowMultiple true if more than one components of this type is allowed on an entity
	 */
	function Component(componentType, allowMultiple) {
		this.componentType = componentType;

		/** If the component should be processed for containing entities
		 * @type {boolean}
		 * @default
		 */
		this.enabled = true;

		/** If it is allowed to have more than one instance of this component on the same Entity
		 * @type {boolean}
		 * @default
		 */
		this.allowMultiple = !!allowMultiple;

		this.ownerEntity = null;
	}

	return Component;
});