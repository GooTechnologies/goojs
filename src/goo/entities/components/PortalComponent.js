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

	function PortalComponent(camera, height, options) {
		height = height || 200;

		this.options = options || {};
		this.options.preciseRecursion = !!this.options.preciseRecursion;
		this.options.autoUpdate = this.options.autoUpdate === false ? false : true;
		this.options.alwaysRender = !!this.options.alwaysRender;

		this.doUpdate = false;

		var aspect = camera.aspect;

		console.log('aspect', aspect, 'height', height, 'height / aspect', height / aspect);

		this.type = 'PortalComponent';
		this.camera = camera;
		this.target = new RenderTarget(height, height / aspect);

		if(this.options.preciseRecursion) {
			this.secondaryTarget = new RenderTarget(height, height / aspect);
		}
	}

	PortalComponent.prototype = Object.create(Component.prototype);

	PortalComponent.prototype.requestUpdate = function() {
		this.doUpdate = true;
	};

	return PortalComponent;
});