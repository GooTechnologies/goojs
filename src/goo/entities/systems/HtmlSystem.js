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
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/HTMLComponent/HTMLComponent-vtest.html Working example
	 */
	function HtmlSystem(renderer) {
		System.call(this, 'HtmlSystem', ['TransformComponent', 'HtmlComponent']);

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

		// SystemBus.addListener('goo.viewportResize', function(data) {
		// 	this.rootDom.style.width = data.width + 'px';
		// 	this.rootDom.style.height = data.height + 'px';
		// 	this.cameraDom.style.width = data.width + 'px';
		// 	this.cameraDom.style.height = data.height + 'px';
		// }.bind(this));

		var frontMaterial = new Material(ShaderLib.simple);
		frontMaterial.blendState.blending = 'CustomBlending';
		frontMaterial.blendState.blendSrc = 'ZeroFactor';
		frontMaterial.blendState.blendDst = 'ZeroFactor';

		var backMaterial = new Material(ShaderLib.uber);
		backMaterial.uniforms.materialDiffuse = [0.5, 0.5, 0.5, 1];
		backMaterial.cullState.cullFace = 'Front';

		this.materials = [frontMaterial, backMaterial];

		// this.prefixes = ['', '-webkit-', '-moz-'];
		// this.prefixes = ['', '-webkit-'];
		this.prefixes = [''];
		this.styleCache = new Map();

		this.precisionScale = 1000; // Thanks browsers
	}

	HtmlSystem.prototype = Object.create(System.prototype);
	HtmlSystem.prototype.constructor = HtmlSystem;

	HtmlSystem.prototype.getCameraCSSMatrix = function (matrix) {
		var elements = matrix.data;

		return 'matrix3d('
			+ elements[0] + ',' + (-elements[1]) + ',' + elements[2] + ',' + elements[3] + ','
			+ elements[4] + ',' + (-elements[5]) + ',' + elements[6] + ',' + elements[7] + ','
			+ elements[8] + ',' + (-elements[9]) + ',' + elements[10] + ',' + elements[11] + ','
			+ elements[12] * this.precisionScale + ',' + (-elements[13]) * this.precisionScale + ',' + elements[14] * this.precisionScale + ',' + elements[15] + ')';
	};

	HtmlSystem.prototype.getEntityCSSMatrix = function (matrix) {
		var elements = matrix.data;

		return 'translate3d(-50%,-50%,0) matrix3d('
			+ elements[0] + ',' + elements[1] + ',' + elements[2] + ',' + elements[3] + ','
			+ (-elements[4]) + ',' + (-elements[5]) + ',' + (-elements[6]) + ',' + (-elements[7]) + ','
			+ elements[8] + ',' + elements[9] + ',' + elements[10] + ',' + elements[11] + ','
			+ elements[12] * this.precisionScale + ',' + elements[13] * this.precisionScale + ',' + elements[14] * this.precisionScale + ',' + elements[15] + ')';
	};

	HtmlSystem.prototype.setStyle = function (element, property, style) {
		var cachedStyle = this.styleCache.get(element);

		if (style !== cachedStyle) {
			for (var j = 0; j < this.prefixes.length; j++) {
				element.style[this.prefixes[j] + property] = style;
			}
			this.styleCache.set(element, style);
		}
	};

	HtmlSystem.prototype.inserted = function (entity) {
		var component = entity.htmlComponent;
		component.meshRendererComponent.materials = this.materials;
	};

	HtmlSystem.prototype.process = function (entities) {
		var camera = this.camera;
		if (!camera) {
			return;
		}

		var style;

		var width = this.renderer.viewportWidth;
		var height = this.renderer.viewportHeight;
		var fov = 0.5 / Math.tan(MathUtils.DEG_TO_RAD * camera.fov * 0.5) * height;

		this.setStyle(this.rootDom, 'perspective', fov + 'px');

		var viewMatrix = camera.getViewMatrix();
		style = 'translate3d(0,0,' + fov + 'px) ' + 
				this.getCameraCSSMatrix(viewMatrix) +
				' translate3d(' + (width/2) + 'px,' + (height/2) + 'px, 0)';
		this.setStyle(this.cameraDom, 'transform', style);

		for (var i = 0, l = entities.length; i < l; i++) {
			var entity = entities[i];
			var component = entity.htmlComponent;
			var domElement = component.domElement;

			// Always show if not using transform (if not hidden)
			if (!component.useTransformComponent) {
				if (!domElement.parentNode) {
					var parentEl = entity._world.gooRunner.renderer.domElement.parentElement || document.body;
					parentEl.appendChild(domElement);
				}

				domElement.style.display = component.hidden ? 'none' : '';
				var translation = entity.getTranslation();
				var style = 'translate(' + translation.x*100 + 'px,' + translation.y*100 + 'px)';
				this.setStyle(domElement, 'transform', style);
				continue;
			} else {
				if (domElement.parentNode !== this.cameraDom) {
					this.cameraDom.appendChild(domElement);
				}
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
			style = this.getEntityCSSMatrix(worldTransform.matrix) + ' scale(' + this.precisionScale / component.width + ', ' + this.precisionScale / component.height + ')';
			this.setStyle(domElement, 'transform', style);
		}
	};

	System.prototype.cleanup = function () {
		System.prototype.cleanup.apply(this, arguments);

		if (this.rootDom.parentNode !== null) {
			this.rootDom.parentNode.removeChild(this.rootDom);
		}
	};

	return HtmlSystem;
});
