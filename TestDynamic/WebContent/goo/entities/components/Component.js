define(function() {
	"use strict";

	/**
	 * @name Component
	 * @class Base class/module for all components
	 * @property {Boolean} enabled If the component should be processed for containing entities
	 */
	function Component() {
		this.enabled = true;
	}

	return Component;
});