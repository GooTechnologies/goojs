define(
	/* @lends */
	function () {
	"use strict";

	/**
	 * @class Helper to draw debug info
	 */
	function DebugDraw() {
		// var frustumData = new SimpleBox(10,10,10);
		// var frustumEntity = EntityUtils.createTypicalEntity(goo.world, frustumData);
		// var frustumMaterial = Material.createMaterial(ShaderLib.simple, 'mat');
		// frustumMaterial.wireframe = true;
		// frustumMaterial.cullState.enabled = false;
		// frustumEntity.meshRendererComponent.cullMode = 'Never';
		// frustumEntity.meshRendererComponent.materials.push(frustumMaterial);
		// frustumEntity.addToWorld();

		// goo.callbacks.push(function () {
		// 	var frustumVerts = frustumData.getAttributeBuffer(MeshData.POSITION);
		// 	var corners = projectedGrid.projectorCamera.calculateFrustumCorners();
		// 	for (var i=0;i<8;i++) {
		// 		frustumVerts[i*3+0] = corners[i].x;
		// 		frustumVerts[i*3+1] = corners[i].y;
		// 		frustumVerts[i*3+2] = corners[i].z;
		// 	}
		// 	frustumData.setVertexDataUpdated();
		// });
	}

	DebugDraw.prototype.countDown = function () {
	};

	return DebugDraw;
});