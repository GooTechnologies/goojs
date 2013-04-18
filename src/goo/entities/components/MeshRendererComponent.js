define(['goo/entities/components/Component'],
	/** @lends */
	function (Component) {
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
		 * @type {Bounding}
		 */
		this.worldBound = null;

		/** Culling mode. Other alid values: 'Never'
		 * @type {string}
		 * @default
		 */
		this.cullMode = 'Dynamic'; //'Dynamic', 'Never'

		this.castShadows = false;
		this.receiveShadows = false;
	}

	MeshRendererComponent.prototype = Object.create(Component.prototype);

	/**
	 * Update world bounding
	 *
	 * @param bounding Bounding volumen in local space
	 * @param transform Transform to apply to local bounding -> world bounding
	 */
	MeshRendererComponent.prototype.updateBounds = function (bounding, transform) {
		this.worldBound = bounding.transform(transform, this.worldBound);
	};

	return MeshRendererComponent;
});