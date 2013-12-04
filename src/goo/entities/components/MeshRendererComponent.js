define([
	'goo/entities/components/Component',
	'goo/math/Vector3',
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