define(['goo/shapes/ShapeCreator'], function(ShapeCreator) {
	"use strict";

	function FullscreenUtil() {
	}

	FullscreenUtil.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	FullscreenUtil.quad = ShapeCreator.createPlaneData(2, 2);

	return FullscreenUtil;
});