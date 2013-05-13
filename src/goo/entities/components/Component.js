define(
	/** @lends */
	function () {
	"use strict";

	/**
	 * @class Base class/module for all components
	 */
	function Component() {
		/** If the component should be processed for containing entities
		 * @type {boolean}
		 * @default
		 */
		this.enabled = true;
	}

	return Component;
});