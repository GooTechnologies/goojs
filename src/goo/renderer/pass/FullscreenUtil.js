define([
	'goo/shapes/Quad',
	'goo/renderer/Camera',
	'goo/math/Vector3'
], function (
	Quad,
	Camera,
	Vector3
) {
	'use strict';

	/**
	 * Utility class with a default setup parallel camera and fullscreen quad for fullscreen pass usage
	 */
	function FullscreenUtil() {}

	var camera = new Camera();
	camera.projectionMode = Camera.Parallel;
	camera.setFrustum(0, 1, -1, 1, 1, -1);
	camera._left.copy(Vector3.UNIT_X).negate();
	camera._up.copy(Vector3.UNIT_Y);
	camera._direction.copy(Vector3.UNIT_Z);
	camera.onFrameChange();
	FullscreenUtil.camera = camera;

	FullscreenUtil.quad = new Quad(2, 2);

	return FullscreenUtil;
});