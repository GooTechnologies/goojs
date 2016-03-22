define([
	'goo/entities/systems/System',
	'goo/renderer/Renderer',
	'goo/math/Matrix4',
	'goo/math/MathUtils',
	'goo/math/Vector3'
], function (
	System,
	Renderer,
	Matrix4,
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

		this.styleCache = new Map();
	}

	HtmlSystem.prototype = Object.create(System.prototype);
	HtmlSystem.prototype.constructor = HtmlSystem;

	// Browsers implement z-index as signed 32bit int.
	// Overflowing pushes the element to the back.
	var MAX_Z_INDEX = 2147483647;
	var tmpVector = new Vector3();

	HtmlSystem.prototype.setStyle = function (element, property, style, doPrefix) {
		var elementCache = this.styleCache.get(element);
		if (!elementCache) {
			elementCache = new Map();
			this.styleCache.set(element, elementCache);
		}

		if (element.styleDirty || style !== elementCache.get(property)) {
			element.style[property] = style;
			if (doPrefix) {
				element.style['-webkit-' + property] = style;
			}

			elementCache.set(property, style);
			element.styleDirty = false;
		}
	};

	HtmlSystem.prototype.process = function (entities) {
		if (entities.length === 0) {
			return;
		}

		var camera = Renderer.mainCamera;
		var renderer = this.renderer;

		var screenWidth = renderer.viewportWidth / renderer.devicePixelRatio;
		var screenHeight = renderer.viewportHeight / renderer.devicePixelRatio;
		var offsetLeft = renderer.domElement.offsetLeft;
		var offsetTop = renderer.domElement.offsetTop;

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var component = entity.htmlComponent;

			// Always show if not using transform (if not hidden)
			if (!component.useTransformComponent) {
				this.setStyle(component.domElement, 'display', component.hidden ? 'none' : '');
				this.setStyle(component.domElement, 'transform', '');
				continue;
			}

			// Hidden
			if (component.hidden) {
				this.setStyle(component.domElement, 'display', 'none');
				continue;
			}

			// Behind camera
			tmpVector.set(camera.translation)
				.sub(entity.transformComponent.worldTransform.translation);
			if (camera._direction.dot(tmpVector) > 0) {
				this.setStyle(component.domElement, 'display', 'none');
				continue;
			}

			// compute world position.
			camera.getScreenCoordinates(entity.transformComponent.worldTransform.translation, screenWidth, screenHeight, tmpVector);
			// Behind near plane
			if (tmpVector.z < 0) {
				this.setStyle(component.domElement, 'display', 'none');
				continue;
			}
			// Else visible
			this.setStyle(component.domElement, 'display', '');

			var fx = tmpVector.x / renderer.devicePixelRatio;
			var fy = tmpVector.y / renderer.devicePixelRatio;

			if (component.pixelPerfect) {
				fx = Math.floor(fx);
				fy = Math.floor(fy);
			}

			this.setStyle(component.domElement, 'transform',
				'translate(-50%, -50%) ' +
				'translate(' + (fx + offsetLeft) + 'px, ' + (fy + offsetTop) + 'px)',
			true);

			this.setStyle(component.domElement, 'zIndex', MAX_Z_INDEX - Math.round(tmpVector.z * MAX_Z_INDEX));
		}
	};

	HtmlSystem.prototype.deleted = function (entity) {
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