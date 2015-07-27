define([
	'goo/renderer/SimplePartitioner',
	'goo/renderer/scanline/SoftwareRenderer'
	],

	function (SimplePartitioner, SoftwareRenderer) {

		'use strict';

		/**
		 * Processes all entities with meshrenderer components.
		 * A SimplePartitioner is used to first view frustum cull the entities.
		 * Each of the view frustum culled entities are then added to an occluderList if it has an OccluderComponent.
		 * The occluder-entities are rendered to a depth-buffer in {SoftwareRenderer} and all the
		 * entities in the renderList are ultimately occlusion culled based on that depth-buffer.
		 */
		function OcclusionPartitioner (parameters) {
			this._viewFrustumCuller = new SimplePartitioner();

			/**
			 * Array of the Entities with an OccluderComponent in the view frustum.
			 * @type {Array<Entity>}
			 */
			this.occluderList = [];
			this.renderer = new SoftwareRenderer(parameters);

			if (parameters.debugContext !== undefined) {
				this.debugContext = parameters.debugContext;
				this.imagedata = this.debugContext.createImageData(parameters.width, parameters.height);
				// Process function with debug writes.
				this.processFunc = function (camera, entities, renderList) {
					// View frustum culling
					this._viewFrustumCuller.process(camera, entities, renderList);
					// Find and add the Occluders in the view frustum.
					this._addVisibleOccluders(renderList);
					// Render the depth buffer using occluder geometries.
					this.renderer.render(this.occluderList);

					// TODO: Remove later , used for debugging.
					this.renderer.copyDepthToColor();

					// Perform the occlusion culling, an array
					var visibleList = this.renderer.performOcclusionCulling(renderList);
					renderList.length = 0;
					// Copy the visible entities to the renderlist.
					for (var i = 0; i < visibleList.length; i++) {
						renderList[i] = visibleList[i];
					}

					// TODO: Remove later , used for debugging.
					this._writeDebugData();
				};
			} else {
				// NO DEBUGGING
				this.processFunc = function (camera, entities, renderList) {
					// View frustum culling
					this._viewFrustumCuller.process(camera, entities, renderList);

					// Find and add the Occluders in the view frustum.
					this._addVisibleOccluders(renderList);

					// Render the depth buffer using occluder geometries.
					this.renderer.render(this.occluderList);

					// Perform the occlusion culling, an array
					var visibleList = this.renderer.performOcclusionCulling(renderList);
					renderList.length = 0;
					// Copy the visible entities to the renderlist.
					for (var i = 0; i < visibleList.length; i++) {
						renderList[i] = visibleList[i];
					}
				};
			}


		}

		OcclusionPartitioner.prototype.added = function (entity) {
			// needed for things like quadtrees etc
			this._viewFrustumCuller.added(entity);
		};

		OcclusionPartitioner.prototype.removed = function (entity) {
			// needed for things like quadtrees etc
			this._viewFrustumCuller.added(entity);
		};

		OcclusionPartitioner.prototype.process = function (camera, entities, renderList) {
			this.processFunc(camera, entities, renderList);
		};

		/**
		 *  Writes the color data , used to debug the culling.
		 */
		OcclusionPartitioner.prototype._writeDebugData = function () {
			this.imagedata.data.set(this.renderer.getColorData());
			this.debugContext.putImageData(this.imagedata, 0, 0);
		};

		/**
		*	Iterates over the entities in the renderlist and adds them to the occluderList if they have a OccluderComponent.
		*/
		OcclusionPartitioner.prototype._addVisibleOccluders = function (renderList) {
			// 'Removes' the elements, but keeps reference used by other classes.
			this.occluderList.length = 0;
			for (var i = 0; i < renderList.length; i++) {
				var entity = renderList[i];
				if (entity.occluderComponent) {
					this.occluderList.push(entity);
				}
			}
		};

		return OcclusionPartitioner;
});