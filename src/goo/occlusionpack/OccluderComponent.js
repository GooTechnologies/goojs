define([
	'goo/entities/components/Component'
	],
	/** @lends OccluderComponent */
	function (Component) {
	'use strict';

	/**
	*	@class This component contains the triangle mesh which forms an occluder shape for the
	*	entity which this component is attached to. The occluder geometry is used for rendering
	*	a depth buffer during occlusion culling.
	*	@constructor
	*
	*	@param {MeshData} meshData The triangle occluder geometry.
	*	@property {String} type The type string. Same as the class name.
	*	@property {MeshData} meshData The triangle occluder geometry.
	*/
	function OccluderComponent(meshData) {
		this.type = 'OccluderComponent';
		this.meshData = meshData;
	}

	OccluderComponent.prototype = Object.create(Component.prototype);

	return OccluderComponent;
});