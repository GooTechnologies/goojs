define([
	'goo/entities/components/Component',
	'goo/math/Vector3',
	'goo/logic/LogicInterface'
],
/** @lends */
function (
	Component,
	Vector3,
	LogicInterface
) {
	"use strict";

	/**
	 * @class Defines the appearance of a mesh, through materials. Using several materials results in multi-pass rendering.
	 */
	function MeshRendererComponent() {
		this.type = 'MeshRendererComponent';

		/** Materials to use when rendering
		 * @type {Material[]}
		 */
		this.materials = [];
		/** Worldspace bounding considering entity transformations
		 * @type {BoundingVolume}
		 */
		this.worldBound = null;

		/** Culling mode. Other valid values: 'Never'
		 * @type {string}
		 * @default
		 */
		this.cullMode = 'Dynamic'; //'Dynamic', 'Never'
		/**
		 * @type {boolean}
		 * @default
		 */
		this.castShadows = true;
		/**
		 * @type {boolean}
		 * @default
		 */
		this.receiveShadows = true;

		/**
		 * @type {boolean}
		 * @default
		 */
		this.isPickable = true;

		/**
		 * @type {boolean}
		 * @default
		 */
		this.isReflectable = true;

		/**
		 * @type {boolean}
		 * @default
		 */
		this.hidden = false;
	}

	MeshRendererComponent.prototype = Object.create(Component.prototype);

	MeshRendererComponent.logicInterface = new LogicInterface("Material");
	MeshRendererComponent.inportShadows = MeshRendererComponent.logicInterface.addInputEvent("toggle-shadows");
	MeshRendererComponent.inportHidden = MeshRendererComponent.logicInterface.addInputEvent("toggle-hidden");
	MeshRendererComponent.inportAmbient = MeshRendererComponent.logicInterface.addInputProperty("ambient", "Vector3", new Vector3(0.5,0.0,0.0));
	
	MeshRendererComponent.prototype.insertIntoLogicLayer = function(logicLayer, interfaceName) {
		this.logicInstance = logicLayer.addInterfaceInstance(MeshRendererComponent.logicInterface, this, interfaceName, false);
	};
	
	MeshRendererComponent.prototype.onPropertyWrite = function(portID, value) {
		if (portID === MeshRendererComponent.inportAmbient && this.materials.length > 0) {
			this.materials[0].materialState.ambient[0] = value[0];
			this.materials[0].materialState.ambient[1] = value[1];
			this.materials[0].materialState.ambient[2] = value[2];
		}
	};

	MeshRendererComponent.prototype.onEvent = function(event) {
		if (event === MeshRendererComponent.inportShadows) {
			this.castShadows = !this.castShadows;
		} else if (event === MeshRendererComponent.inportHidden) {
			this.hidden = !this.hidden;
		}
	};

	/**
	 * Update world bounding
	 *
	 * @param {BoundingVolume} bounding Bounding volumen in local space
	 * @param {Transform} transform Transform to apply to local bounding -> world bounding
	 */
	MeshRendererComponent.prototype.updateBounds = function (bounding, transform) {
		this.worldBound = bounding.transform(transform, this.worldBound);
	};

	return MeshRendererComponent;
});