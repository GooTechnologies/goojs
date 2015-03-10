define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/renderer/Renderer',
	'goo/math/Matrix4x4',
	'goo/math/MathUtils',
	'goo/math/Vector3'
],  function (
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
	 */
	function CSS3DSystem(renderer) {
		System.call(this, 'CSS3DSystem', ['TransformComponent', 'CSS3DComponent']);

		this.camera = null;
		this.renderer = renderer;

		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			this.camera = newCam.camera;
		}.bind(this));

		var domElement = this.viewDom = document.createElement('div');
		document.body.appendChild(domElement);
		domElement.style.position = 'absolute';
		domElement.style.overflow = 'hidden';
		// domElement.style.pointerEvents = 'none';
		domElement.style.WebkitTransformStyle = 'preserve-3d';
		domElement.style.transformStyle = 'preserve-3d';
		domElement.style.width = '100%';
		domElement.style.height = '100%';
		domElement.style.top = '0px';
		domElement.style.bottom = '0px';
		domElement.style.left = '0px';
		domElement.style.right = '0px';

		var cameraElement = this.containerDom = document.createElement('div');
		cameraElement.style.WebkitTransformStyle = 'preserve-3d';
		cameraElement.style.transformStyle = 'preserve-3d';
		cameraElement.style.width = '100%';
		cameraElement.style.height = '100%';

		domElement.appendChild( cameraElement );

		// SystemBus.addListener('goo.viewportResize', function(data) {
		// 	this.viewDom.style.width = data.width + 'px';
		// 	this.viewDom.style.height = data.height + 'px';
		// 	this.containerDom.style.width = data.width + 'px';
		// 	this.containerDom.style.height = data.height + 'px';
		// }.bind(this));

		this.prefixes = ['', '-webkit-'];
		this.styleCache = new Map();
	}

	var tmpMatrix = new Matrix4x4();
	// var tmpMatrix2 = new Matrix4x4();
	var tmpVector = new Vector3();

	CSS3DSystem.prototype = Object.create(System.prototype);
	CSS3DSystem.prototype.constructor = CSS3DSystem;

	var getCameraCSSMatrix = function (matrix) {
		var elements = matrix.data;

		return 'matrix3d('
			+ elements[0] + ',' + (-elements[1]) + ',' + elements[2] + ',' + elements[3] + ','
			+ elements[4] + ',' + (-elements[5]) + ',' + elements[6] + ',' + elements[7] + ','
			+ elements[8] + ',' + (-elements[9]) + ',' + elements[10] + ',' + elements[11] + ','
			+ elements[12] + ',' + (-elements[13]) + ',' + elements[14] + ',' + elements[15] + ')';
	};

	var getEntityCSSMatrix = function (matrix) {
		var elements = matrix.data;

		return 'translate3d(-50%,-50%,0) matrix3d('
			+ elements[0] + ',' + elements[1] + ',' + elements[2] + ',' + elements[3] + ','
			+ (-elements[4]) + ',' + (-elements[5]) + ',' + (-elements[6]) + ',' + (-elements[7]) + ','
			+ elements[8] + ',' + elements[9] + ',' + elements[10] + ',' + elements[11] + ','
			+ elements[12] + ',' + elements[13] + ',' + elements[14] + ',' + elements[15] + ')';
	};

	CSS3DSystem.prototype.setStyle = function (element, property, style) {
		var cachedStyle = this.styleCache.get(element);

		if (style !== cachedStyle) {
			for (var j = 0; j < this.prefixes.length; j++) {
				element.style[this.prefixes[j] + property] = style;
			}
			this.styleCache.set(element, style);
		}
	};

	CSS3DSystem.prototype.inserted = function (entity) {
		var component = entity.cSS3DComponent;
		var domElement = component.domElement;
		domElement.style.position = 'absolute';
		domElement.style.WebkitBackfaceVisibility = component.backfaceVisibility;
		domElement.style.backfaceVisibility = component.backfaceVisibility;
		component.setSize(component.width, component.height);
		if (domElement.parentNode !== this.containerDom) {
			this.containerDom.appendChild(domElement);
		}
	};

	CSS3DSystem.prototype.deleted = function (entity) {
		var domElement = entity.cSS3DComponent.domElement;
		if (domElement.parentNode !== null) {
			domElement.parentNode.removeChild(domElement);
		}
	};

	CSS3DSystem.prototype.process = function (entities) {
		var camera = this.camera;
		if (!camera) {
			return;
		}

		var style;

		var width = this.renderer.viewportWidth;
		var height = this.renderer.viewportHeight;
		var fov = 0.5 / Math.tan(MathUtils.DEG_TO_RAD * camera.fov * 0.5) * height;

		this.setStyle(this.viewDom, 'perspective', fov + 'px');

		var viewMatrix = camera.getViewMatrix();
		style = 'translate3d(0,0,' + fov + 'px) ' + 
				getCameraCSSMatrix(viewMatrix) +
				' translate3d(' + (width/2) + 'px,' + (height/2) + 'px, 0)';
		this.setStyle(this.containerDom, 'transform', style);

		var viewInverseMatrix = camera.getViewInverseMatrix();
		for (var i = 0, l = entities.length; i < l; i++) {
			var entity = entities[i];
			var component = entity.cSS3DComponent;
			var domElement = component.domElement;

			// Always show if not using transform (if not hidden)
			// if (!component.useTransformComponent) {
			// 	domElement.style.display = component.hidden ? 'none' : '';
			// 	this.setStyle(domElement, 'transform', '');
			// 	continue;
			// }

			if (!component.updated && !entity.transformComponent._updatedThisFrame && !component.faceCamera) {
				continue;
			}
			component.updated = false;

			var scale = component.scale;
			var worldTransform = entity.transformComponent.worldTransform;

			if (component.faceCamera) {
				tmpMatrix.copy(viewInverseMatrix);

				worldTransform.matrix.getTranslation(tmpVector);
				tmpMatrix.setTranslation(tmpVector);

				entity.transformComponent.transform.matrix.getScale(tmpVector);
				tmpVector.x *= (scale/component.width);
				tmpVector.y *= (scale/component.height);
				style = getEntityCSSMatrix(tmpMatrix) + ' scale3d('+tmpVector.x+','+tmpVector.y+','+1+')';
				// style = getEntityCSSMatrix(tmpMatrix) + ' scale3d('+(scale/component.width)+','+
				// 	(scale/component.height)+','+1+')';
			} else {
				style = getEntityCSSMatrix(worldTransform.matrix) + ' scale3d('+(scale/component.width)+','+
					(scale/component.height)+','+1+')';
			}

			this.setStyle(domElement, 'transform', style);
		}
	};

	System.prototype.cleanup = function () {
		System.prototype.cleanup.apply(this, arguments);

		if (this.viewDom.parentNode !== null) {
			this.viewDom.parentNode.removeChild(this.viewDom);
		}
	};

	return CSS3DSystem;
});
