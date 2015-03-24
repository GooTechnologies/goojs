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
		rootDom.style.zIndex = '-1';
		rootDom.style.position = 'absolute';
		rootDom.style.overflow = 'hidden';
		// rootDom.style.pointerEvents = 'none';
		rootDom.style.WebkitTransformStyle = 'preserve-3d';
		rootDom.style.transformStyle = 'preserve-3d';
		rootDom.style.width = '100%';
		rootDom.style.height = '100%';
		rootDom.style.top = '0px';
		rootDom.style.bottom = '0px';
		rootDom.style.left = '0px';
		rootDom.style.right = '0px';

		var cameraDom = this.cameraDom = document.createElement('div');
		cameraDom.style.WebkitTransformStyle = 'preserve-3d';
		cameraDom.style.transformStyle = 'preserve-3d';
		cameraDom.style.width = '100%';
		cameraDom.style.height = '100%';

		rootDom.appendChild( cameraDom );

		// SystemBus.addListener('goo.viewportResize', function(data) {
		// 	this.rootDom.style.width = data.width + 'px';
		// 	this.rootDom.style.height = data.height + 'px';
		// 	this.cameraDom.style.width = data.width + 'px';
		// 	this.cameraDom.style.height = data.height + 'px';
		// }.bind(this));

		this.materialTransparent = new Material(ShaderLib.uber);
		this.materialTransparent.renderQueue = 10000;
		this.materialTransparent.uniforms.opacity = 0.0;
		this.materialTransparent.uniforms.materialAmbient = [0, 0, 0, 0];
		this.materialTransparent.uniforms.materialDiffuse = [0, 0, 0, 0];

		this.materialOpaque = new Material(ShaderLib.uber);
		this.materialOpaque.uniforms.materialDiffuse = [0.5, 0.5, 0.5, 1];
		this.materialOpaque.cullState.cullFace = 'Front';

		var frontMaterial = new Material(ShaderLib.simple);
		frontMaterial.blendState.blending = 'CustomBlending';
		frontMaterial.blendState.blendSrc = 'ZeroFactor';
		frontMaterial.blendState.blendDst = 'ZeroFactor';

		var backMaterial = new Material(ShaderLib.uber);
		backMaterial.uniforms.materialDiffuse = [0.5, 0.5, 0.5, 1];
		backMaterial.cullState.cullFace = 'Front';
		this.materials = [frontMaterial, backMaterial];

		this.prefixes = ['', '-webkit-'];
		this.styleCache = new Map();
	}

	HtmlSystem.prototype = Object.create(System.prototype);
	HtmlSystem.prototype.constructor = HtmlSystem;

	// var tmpMatrix = new Matrix4x4();
	// var tmpVector = new Vector3();

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
		// var domElement = component.domElement;
		// if (domElement.parentNode !== this.cameraDom) {
		// 	this.cameraDom.appendChild(domElement);
		// }

		component.entity = entity;

		// insert quads etc
		if (false && component.useTransformComponent && !entity.meshRendererComponent && !entity.meshDataComponent) {
			// var quad = new Quad(component.width, component.height);
			// entity.set(quad);
			// entity.set(this.materialTransparent);

			// var entityBack = entity._world.createEntity(quad, this.materialOpaque).addToWorld();
			// entityBack.meshRendererComponent.isPickable = false;
			// entity.attachChild(entityBack);
		}
	};

	HtmlSystem.prototype.deleted = function (entity) {
		// var domElement = entity.htmlComponent.domElement;
		// if (domElement.parentNode !== null) {
		// 	domElement.parentNode.removeChild(domElement);
		// }

		// if (entity.meshRendererComponent || entity.meshDataComponent) {
		// 	entity.clearComponent('meshDataComponent');
		// 	entity.clearComponent('meshRendererComponent');
		// }
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
				getCameraCSSMatrix(viewMatrix) +
				' translate3d(' + (width/2) + 'px,' + (height/2) + 'px, 0)';
		this.setStyle(this.cameraDom, 'transform', style);

		// var viewInverseMatrix = camera.getViewInverseMatrix();
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
				//component.entity.hide();
				continue;
			} else {
				component.domElement.style.display = '';
				//component.entity.show();
			}

			if (!component.updated && !entity.transformComponent._updated) {
				continue;
			}
			component.updated = false;

			// var scale = component.scale;
			var worldTransform = entity.transformComponent.worldTransform;

			// if (component.faceCamera) {
			// 	tmpMatrix.copy(viewInverseMatrix);

			// 	worldTransform.matrix.getTranslation(tmpVector);
			// 	tmpMatrix.setTranslation(tmpVector);

			// 	entity.transformComponent.transform.matrix.getScale(tmpVector);
			// 	tmpVector.x *= (1/component.width);
			// 	tmpVector.y *= (1/component.height);
			// 	style = getEntityCSSMatrix(tmpMatrix) + ' scale3d('+tmpVector.x+','+tmpVector.y+','+1+')';
			// } else {
			// 	style = getEntityCSSMatrix(worldTransform.matrix);
			// }
			style = getEntityCSSMatrix(worldTransform.matrix) + ' scale(' + 1/component.width +', ' + 1/component.height + ')';

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
