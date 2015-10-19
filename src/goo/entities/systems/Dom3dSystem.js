define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/renderer/Renderer',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Quad',
	'goo/math/Matrix4x4',
	'goo/math/Vector3',
	'goo/math/MathUtils'
], function (
	System,
	SystemBus,
	Renderer,
	Material,
	ShaderLib,
	Quad,
	Matrix4x4,
	Vector3,
	MathUtils
) {
	'use strict';

	/**
	 * @extends System
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/Dom3dComponent/Dom3dComponent-vtest.html Working example
	 */
	function Dom3dSystem(renderer) {
		System.call(this, 'Dom3dSystem', ['TransformComponent', 'Dom3dComponent']);

		this.renderer = renderer;
		this.camera = null;

		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			this.camera = newCam.camera;
		}.bind(this));

		var rootDom = this.rootDom = document.createElement('div');
		document.body.appendChild(rootDom);
		// rootDom.style.pointerEvents = 'none';
		rootDom.style.zIndex = '-1';
		rootDom.style.position = 'absolute';
		rootDom.style.overflow = 'hidden';
		// rootDom.style.webkitTransformStyle = 'preserve-3d';
		// rootDom.style.mozTransformStyle = 'preserve-3d';
		rootDom.style.transformStyle = 'preserve-3d';
		rootDom.style.width = '100%';
		rootDom.style.height = '100%';
		rootDom.style.top = '0px';
		rootDom.style.bottom = '0px';
		rootDom.style.left = '0px';
		rootDom.style.right = '0px';

		var cameraDom = this.cameraDom = document.createElement('div');
		// cameraDom.style.webkitTransformStyle = 'preserve-3d';
		// cameraDom.style.mozTransformStyle = 'preserve-3d';
		cameraDom.style.transformStyle = 'preserve-3d';
		cameraDom.style.width = '100%';
		cameraDom.style.height = '100%';

		rootDom.appendChild(cameraDom);

		var frontMaterial = new Material(ShaderLib.simple);
		frontMaterial.blendState.blending = 'CustomBlending';
		frontMaterial.blendState.blendSrc = 'ZeroFactor';
		frontMaterial.blendState.blendDst = 'ZeroFactor';

		var backMaterial = new Material(ShaderLib.uber);
		backMaterial.uniforms.materialDiffuse = [0.5, 0.5, 0.5, 1];
		backMaterial.cullState.cullFace = 'Front';

		this.materials = [frontMaterial, backMaterial];

		// this.prefixes = ['', '-webkit-', '-moz-'];
		this.prefixes = ['', '-webkit-'];
		this.styleCache = new Map();

		this.precisionScale = 1000; // Thanks browsers
	}

	Dom3dSystem.prototype = Object.create(System.prototype);
	Dom3dSystem.prototype.constructor = Dom3dSystem;

	Dom3dSystem.prototype.getCameraCSSMatrix = function (matrix) {
		var elements = matrix.data;

		return 'matrix3d('
			+ elements[0] + ',' + (-elements[1]) + ',' + elements[2] + ',' + elements[3] + ','
			+ elements[4] + ',' + (-elements[5]) + ',' + elements[6] + ',' + elements[7] + ','
			+ elements[8] + ',' + (-elements[9]) + ',' + elements[10] + ',' + elements[11] + ','
			+ elements[12] * this.precisionScale + ',' + (-elements[13]) * this.precisionScale + ',' + elements[14] * this.precisionScale + ',' + elements[15] + ')';
	};

	Dom3dSystem.prototype.getEntityCSSMatrix = function (matrix) {
		var elements = matrix.data;

		return 'translate3d(-50%,-50%,0) matrix3d('
			+ elements[0] + ',' + elements[1] + ',' + elements[2] + ',' + elements[3] + ','
			+ (-elements[4]) + ',' + (-elements[5]) + ',' + (-elements[6]) + ',' + (-elements[7]) + ','
			+ elements[8] + ',' + elements[9] + ',' + elements[10] + ',' + elements[11] + ','
			+ elements[12] * this.precisionScale + ',' + elements[13] * this.precisionScale + ',' + elements[14] * this.precisionScale + ',' + elements[15] + ')';
	};

	Dom3dSystem.prototype.setStyle = function (element, property, style) {
		var cachedStyle = this.styleCache.get(element);

		if (style !== cachedStyle) {
			for (var j = 0; j < this.prefixes.length; j++) {
				element.style[this.prefixes[j] + property] = style;
			}
			this.styleCache.set(element, style);
		}
	};

	Dom3dSystem.prototype.inserted = function (entity) {
		var component = entity.dom3dComponent;
		component.meshRendererComponent.materials = this.materials;
	};

	Dom3dSystem.prototype.process = function (entities) {
		var camera = this.camera;
		if (!camera) {
			return;
		}

		var width = this.renderer.viewportWidth / this.renderer.devicePixelRatio;
		var height = this.renderer.viewportHeight / this.renderer.devicePixelRatio;
		var fov = 0.5 / Math.tan(MathUtils.DEG_TO_RAD * camera.fov * 0.5) * height;

		this.setStyle(this.rootDom, 'perspective', fov + 'px');

		var viewMatrix = camera.getViewMatrix();
		var style = 'translate3d(0,0,' + fov + 'px) ' + 
				this.getCameraCSSMatrix(viewMatrix) +
				' translate3d(' + (width/2) + 'px,' + (height/2) + 'px, 0)';
		this.setStyle(this.cameraDom, 'transform', style);

		for (var i = 0, l = entities.length; i < l; i++) {
			var entity = entities[i];
			var component = entity.dom3dComponent;
			var domElement = component.domElement;

			if (domElement.parentNode !== this.cameraDom) {
				this.cameraDom.appendChild(domElement);
			}

			// Do we really have to set this every time?
			if (component.hidden) {
				component.domElement.style.display = 'none';
				continue;
			} else {
				component.domElement.style.display = '';
			}

			if (!component.updated && !entity.transformComponent._updated) {
				continue;
			}
			component.updated = false;

			var worldTransform = entity.transformComponent.worldTransform;
			style = this.getEntityCSSMatrix(worldTransform.matrix) + 
					' scale(' + this.precisionScale / component.width + 
					', ' + this.precisionScale / component.height + ')';
			this.setStyle(domElement, 'transform', style);
		}
	};

	System.prototype.cleanup = function () {
		System.prototype.cleanup.apply(this, arguments);

		if (this.rootDom.parentNode !== null) {
			this.rootDom.parentNode.removeChild(this.rootDom);
		}
	};

	return Dom3dSystem;
});
