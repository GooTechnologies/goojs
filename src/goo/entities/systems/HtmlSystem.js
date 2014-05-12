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

			// Always show if not using transform
			if (!component.useTransformComponent) {
				component.domElement.style.display = '';
				setStyle(component.domElement, 'transform', '');
				continue;
			}

			// Hidden
			if (component.hidden) {
				component.domElement.style.display = 'none';
				continue;
			}

			// Behind camera
			this.tmpVector.setv(camera.translation)
				.subv(entity.transformComponent.worldTransform.translation);
			if (camera._direction.dot(this.tmpVector) > 0) {
				component.domElement.style.display = 'none';
				continue;
			}

			// compute world position.
			camera.getScreenCoordinates(entity.transformComponent.worldTransform.translation, screenWidth, screenHeight, this.tmpVector);
			// Behind near plane
			if (this.tmpVector.z < 0) {
				if (component.hidden !== true) {
					component.domElement.style.display = 'none';
					//component.hidden = true;
				}
				continue;
			}
			// Else visible
			component.domElement.style.display = '';

			var renderer = this.renderer;
			var devicePixelRatio = renderer._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / renderer.svg.currentScale : 1;
			var fx = Math.floor(this.tmpVector.x/devicePixelRatio);
			var fy = Math.floor(this.tmpVector.y/devicePixelRatio);

			setStyle(component.domElement, 'transform',
				'translate(-50%, -50%) '+
				'translate(' + fx + 'px, ' + fy + 'px)'+
				'translate(' + renderer.domElement.offsetLeft + 'px, ' + renderer.domElement.offsetTop + 'px)');
			// project
		}
	};

	return HtmlSystem;
});