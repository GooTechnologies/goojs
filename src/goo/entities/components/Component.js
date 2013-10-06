define(
	/** @lends */
	function () {
	"use strict";

	/**
	 * @class Base class/module for all components
	 */
	function Component(type, allowMultiple) {
		this.type = type;

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