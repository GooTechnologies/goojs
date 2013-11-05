define([
	'goo/entities/components/Component'
],
/** @lends */
function (
	Component
) {
	"use strict";

	function PrintValueComponent() {
	
		Component.call(this);
		
		this.type = 'PrintValueComponent';

		/** Parent transformcomponent in the "scene graph"
		 * @type {PrintValueComponent}
		 * @default
		 */
		this.parent = null;

		var ctx = this;
		
		// Register float input property
		this._readInput = this.addInputProperty("floatInput", "float", "0", function(nv) {
			ctx.onFloatInputChanged(nv);
		});
	}
	
	PrintValueComponent.prototype = Object.create(Component.prototype);
	
	PrintValueComponent.prototype.onFloatInputChanged = function(nv) {
		console.log("I got an update for the value; " + nv);
	}

	/**
	 * Mark the component for updates of world transform
	 */
	PrintValueComponent.prototype.setUpdated = function () {
		this._dirty = true;
	}
	
	return PrintValueComponent;

});