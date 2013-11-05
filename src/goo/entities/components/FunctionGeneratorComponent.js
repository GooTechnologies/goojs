define([
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/entities/components/Component'
],
/** @lends */
function (
	Transform,
	Vector3,
	Component
) {
	"use strict";

	/**
	 * @class Holds the transform of an entity. It also allows for a scene graph to be created, where transforms are inherited
	 * down the tree.
	 */
	function FunctionGeneratorComponent() {
	
		Component.call(this);
		
		this.type = 'FunctionGeneratorComponent';

		/** Parent transformcomponent in the "scene graph"
		 * @type {FunctionGeneratorComponent}
		 * @default
		 */
		this.parent = null;
		this._time = 0;

		this._functionValueWriter = this.addOutputProperty("functionValue", "float", 0);
	}

	FunctionGeneratorComponent.prototype = Object.create(Component.prototype);

	FunctionGeneratorComponent.prototype.updateComponent = function(tpf) {
		this._time += tpf;
		this._functionValueWriter(Math.sin(this._time));
	}

	/**
	 * Mark the component for updates of world transform
	 */
	FunctionGeneratorComponent.prototype.setUpdated = function () {
		this._dirty = true;
	}
	
	return FunctionGeneratorComponent;

});