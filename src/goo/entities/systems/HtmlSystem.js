define([
	'goo/entities/systems/System',
	'goo/renderer/Renderer',
	'goo/math/Matrix4x4',
	'goo/math/MathUtils',
	'goo/math/Vector3'
],
/** @lends */
function (
	System,
	Renderer,
	Matrix4x4,
	MathUtils,
	Vector3
	) {
	'use strict';

	/**
	 * @class
	 * @extends System
	 */
	function HtmlSystem(renderer) {
		System.call(this, 'HtmlSystem', ['TransformComponent', 'HtmlComponent']);
		this.renderer = renderer;
		this.tmpVector = new Vector3();
	}

	HtmlSystem.prototype = Object.create(System.prototype);

	// Copied from CSSTransformComponent
	var prefixes = ["", "-webkit-", "-moz-", "-ms-", "-o-"];
	var setStyle = function(element, property, style) {
		for (var j = 0; j < prefixes.length; j++) {
			element.style[prefixes[j] + property] = style;
		}
	};

	HtmlSystem.prototype.process = function(entities) {
		if (entities.length === 0) {
			return;
		}

		var camera = Renderer.mainCamera;
		var screenWidth = this.renderer.domElement.width;
		var screenHeight = this.renderer.domElement.height;

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var component = entity.htmlComponent;

			// compute world position.
			camera.getScreenCoordinates(entity.transformComponent.worldTransform.translation, screenWidth, screenHeight, this.tmpVector);

			//! AT: should be done exactly how it's done for meshRendererComponent
			// hacking it for now
			if (component.hidden) {
				//! AT: is setting this every frame evil?
				// is checking for it and setting it only if different less evil?
				component.domElement.style.display = 'none';
			} else {
				if (this.tmpVector.z < 0) {
					if (component.hidden !== true) {
						component.domElement.style.display = 'none';
						component.hidden = true;
					}
					continue;
				} else if (component.hidden === true) {
					component.domElement.style.display = 'none'; //! AT: should be 'none'; was ''
				} else {
					component.domElement.style.display = '';
				}
			}

			var renderer = this.renderer;
			if (component.useTransformComponent) {
				var devicePixelRatio = renderer._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / renderer.svg.currentScale : 1;

				var fx = Math.floor(this.tmpVector.x/devicePixelRatio);
				var fy = Math.floor((screenHeight - this.tmpVector.y)/devicePixelRatio);

				setStyle(component.domElement, 'transform', 'translate(-50%, -50%) translate(' + fx + 'px, ' + fy + 'px)');
			}
			else {
				setStyle(component.domElement, 'transform', '');
			}
			// project
		}
	};

	return HtmlSystem;
});