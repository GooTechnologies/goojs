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

	function PortalComponent(camera, height) {
		height = height || 200;

		var aspect = camera.aspect;
		console.log('aspect', aspect, 'height', height, 'height / aspect', height / aspect);

		this.type = 'PortalComponent';
		this.camera = camera;
		this.target = new RenderTarget(height, height / aspect);
	}

	PortalComponent.prototype = Object.create(Component.prototype);

	return PortalComponent;
});