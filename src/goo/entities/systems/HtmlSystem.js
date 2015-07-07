define([
	'goo/entities/systems/System',
	'goo/renderer/Renderer',
	'goo/math/Matrix4x4',
	'goo/math/MathUtils',
	'goo/math/Vector3'
], function (
	System,
	Renderer,
	Matrix4x4,
	MathUtils,
	Vector3
	) {
	'use strict';

	/**
	 * @extends System
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/HTMLComponent/HTMLComponent-vtest.html Working example
	 */
	function HtmlSystem(renderer) {
		System.call(this, 'HtmlSystem', ['TransformComponent', 'HtmlComponent']);
		this.renderer = renderer;
	}

	HtmlSystem.prototype = Object.create(System.prototype);
	HtmlSystem.prototype.constructor = HtmlSystem;

	//
	// Browsers implement z-index as signed 32bit int.
	// Overflowing pushes the element to the back.
	//
	var MAX_Z_INDEX = 2147483647;

	var tmpVector = new Vector3();

	// Copied from CSSTransformComponent
	var prefixes = ["", "-webkit-", "-moz-", "-ms-", "-o-"];
	var setStyle = function (element, property, style) {
		for (var j = 0; j < prefixes.length; j++) {
			element.style[prefixes[j] + property] = style;
		}
	};

	HtmlSystem.prototype.process = function (entities) {
		if (entities.length === 0) {
			return;
		}

		var camera = Renderer.mainCamera;
		var screenWidth = this.renderer.domElement.width;
		var screenHeight = this.renderer.domElement.height;

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var component = entity.htmlComponent;

			// Always show if not using transform (if not hidden)
			if (!component.useTransformComponent) {
				component.domElement.style.display = component.hidden ? 'none' : '';
				setStyle(component.domElement, 'transform', '');
				continue;
			}

			// Hidden
			if (component.hidden) {
				component.domElement.style.display = 'none';
				continue;
			}

			// Behind camera
			tmpVector.setVector(camera.translation)
				.subVector(entity.transformComponent.worldTransform.translation);
			if (camera._direction.dot(tmpVector) > 0) {
				component.domElement.style.display = 'none';
				continue;
			}

			// compute world position.
			camera.getScreenCoordinates(entity.transformComponent.worldTransform.translation, screenWidth, screenHeight, tmpVector);
			// Behind near plane
			if (tmpVector.z < 0) {
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
			var fx = Math.floor(tmpVector.x / devicePixelRatio);
			var fy = Math.floor(tmpVector.y / devicePixelRatio);

			setStyle(component.domElement, 'transform',
				'translate(-50%, -50%) ' +
				'translate(' + fx + 'px, ' + fy + 'px)' +
				'translate(' + renderer.domElement.offsetLeft + 'px, ' + renderer.domElement.offsetTop + 'px)');

			component.domElement.style.zIndex = MAX_Z_INDEX - Math.round(tmpVector.z * MAX_Z_INDEX);
		}
	};

	HtmlSystem.prototype.deleted = function(entity) {
		if (!entity || !entity.htmlComponent) {
			return;
		}

		var component = entity.htmlComponent;
		if (component.domElement.parentNode) {
			component.domElement.parentNode.removeChild(component.domElement);
		}
		component.domElement = null;
	};

	return HtmlSystem;
});
