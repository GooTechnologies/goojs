define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/renderer/Renderer',
	'goo/math/Matrix4x4',
	'goo/math/MathUtils',
	'goo/math/Vector3'
], function (
	System,
	SystemBus,
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
		this.camera = null;

		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			this.camera = newCam.camera;
		}.bind(this));

		this.prefixes = ['', '-webkit-'];
		this.styleCache = new Map();
	}

	HtmlSystem.prototype = Object.create(System.prototype);
	HtmlSystem.prototype.constructor = HtmlSystem;

	// Browsers implement z-index as signed 32bit int.
	// Overflowing pushes the element to the back.
	var MAX_Z_INDEX = 2147483647;

	var tmpVector = new Vector3();

	HtmlSystem.prototype.setStyle = function (element, property, style) {
		var cachedStyle = this.styleCache.get(element);

		if (style !== cachedStyle) {
			for (var j = 0; j < this.prefixes.length; j++) {
				element.style[this.prefixes[j] + property] = style;
			}
			this.styleCache.set(element, style);
		}
	};

	HtmlSystem.prototype.process = function (entities) {
		var camera = this.camera;
		var entitiesLength = entities.length;
		if (!camera || entitiesLength === 0) {
			return;
		}

		var renderer = this.renderer;
		var screenWidth = renderer.domElement.width;
		var screenHeight = renderer.domElement.height;
		var offsetLeft = renderer.domElement.offsetLeft;
		var offsetTop = renderer.domElement.offsetTop;

		for (var i = 0; i < entitiesLength; i++) {
			var entity = entities[i];
			var component = entity.htmlComponent;

			// Always show if not using transform (if not hidden)
			if (!component.useTransformComponent) {
				component.domElement.style.display = component.hidden ? 'none' : '';
				this.setStyle(component.domElement, 'transform', '');
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
				}
				continue;
			}
			// Else visible
			component.domElement.style.display = '';

			var devicePixelRatio = renderer._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / renderer.svg.currentScale : 1;
			var fx = Math.floor(tmpVector.x / devicePixelRatio);
			var fy = Math.floor(tmpVector.y / devicePixelRatio);

			this.setStyle(component.domElement, 'transform',
				'translate(-50%, -50%) ' +
				'translate(' + fx + 'px, ' + fy + 'px)' +
				'translate(' + offsetLeft + 'px, ' + offsetTop + 'px)');

			component.domElement.style.zIndex = MAX_Z_INDEX - Math.round(tmpVector.z * MAX_Z_INDEX);
		}
	};

	HtmlSystem.prototype.deleted = function(entity) {
		if (!entity || !entity.htmlComponent) {
			return;
		}
		this.styleCache.clear();
		var component = entity.htmlComponent;
		if (component.domElement.parentNode) {
			component.domElement.parentNode.removeChild(component.domElement);
		}
		component.domElement = null;
	};

	return HtmlSystem;
});
