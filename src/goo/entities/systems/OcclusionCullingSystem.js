define([
	'goo/entities/systems/System',
	'goo/renderer/SimplePartitioner',
	'goo/renderer/scanline/SoftwareRenderer'
	],
	/** @lends OcclusionCullingSystem */
	function (System, SimplePartitioner, SoftwareRenderer) {
	"use strict";

	/**
	*	@class Processes all entities with meshrenderer components.
	*	A SimplePartitioner is used to first view frustum cull the entities.
	*	Each of the view frustum culled entities are then added to an occluderList if it has an OccluderComponent.
	*	The occluder-entities are rendered to a depth-buffer in {SoftwareRenderer} and all the 
	*	entities in the renderList are ultimately occlusion culled based on that depth-buffer.
	*
	*	@param {{camera:Camera, width:Number, height:Number}} parameters <ul> <li>camera, the camera used in the world.</li> <li>width, the width of the depth buffer.</li> <li>height, the height of the depth buffer.</li> </ul>
	*/
	function OcclusionCullingSystem (parameters) {
		System.call(this, 'OcclusionCullingSystem', ['MeshRendererComponent']);

		// TODO : Fail if some parameters are missing.
		parameters = parameters || {};

		this.partitioner = new SimplePartitioner();

		/**
		*	Array of the Entities in the view frustum.
		*	@type {Array.<Entity>}
		*/
		this.renderList = [];
		/**
		*	Array of the Entities with an OccluderComponent in the view frustum.
		*	@type {Array.<Entity>}
		*/
		this.occluderList = [];

		this.camera = parameters.camera;

		/**
		*	The SoftwareRenderer.
		*	@type {SoftwareRenderer}
		*/
		this.renderer = new SoftwareRenderer({
			width: parameters.width,
			height: parameters.height,
			camera: parameters.camera
		});
	}

	OcclusionCullingSystem.prototype = Object.create(System.prototype);

	OcclusionCullingSystem.prototype.inserted = function (entity) {
		if (this.partitioner) {
			this.partitioner.added(entity);
		}
	};

	OcclusionCullingSystem.prototype.deleted = function (entity) {
		if (this.partitioner) {
			this.partitioner.removed(entity);
		}
	};

	OcclusionCullingSystem.prototype.process = function (entities) {
		// 'Removes' the elements, but keeps reference used by other classes.
		this.renderList.length = 0;
		// View frustum culling
		this.partitioner.process(this.camera, entities, this.renderList);
		// Find and add the Occluders in the view frustum.
		this._addVisibleOccluders();
		// Render the depth buffer using occluder geometries.
		this.renderer.render(this.occluderList);

		// TODO: Remove later , used for debugging.
		this.renderer.copyDepthToColor();

		// Perform the occlusion culling, entities are removed from the renderlist if they are occluded.
		this.renderer.performOcclusionCulling(this.renderList);
	};

	/**
	*	Iterates over the entities in the renderlist and adds them to the occluderList if they have a OccluderComponent.
	*/
	OcclusionCullingSystem.prototype._addVisibleOccluders = function () {
		// 'Removes' the elements, but keeps reference used by other classes.
		this.occluderList.length = 0;
		for (var i = 0; i < this.renderList.length; i++) {
			var entity = this.renderList[i];
			if (entity.getComponent('OccluderComponent')) {
				this.occluderList.push(entity);
			}
		}
	};

	return OcclusionCullingSystem;
});