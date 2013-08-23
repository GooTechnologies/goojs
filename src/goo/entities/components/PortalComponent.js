define([
	'goo/entities/components/Component',
	'goo/renderer/pass/RenderTarget'
],
/** @lends */
function(
	Component,
	RenderTarget
	) {
	"use strict";

	function PortalComponent(camera, aspectRatio, multiply) {
		aspectRatio = aspectRatio || 1;
		multiply = multiply || 200;

		this.type = 'PortalComponent';
		this.camera = camera;
		// get aspect ratio from camera and multiply with resolution multiplier
		this.target = new RenderTarget(multiply, aspectRatio * multiply);
	}

	PortalComponent.prototype = Object.create(Component.prototype);

	return PortalComponent;
});