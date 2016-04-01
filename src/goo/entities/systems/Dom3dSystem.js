var System = require('../../entities/systems/System');
var SystemBus = require('../../entities/SystemBus');
var Material = require('../../renderer/Material');
var ShaderLib = require('../../renderer/shaders/ShaderLib');
var Vector3 = require('../../math/Vector3');
var Ray = require('../../math/Ray');
var MathUtils = require('../../math/MathUtils');

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
	}.bind(this), true);

	this.playing = true;

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

Dom3dSystem.prototype.init = function () {
	var ray = new Ray();
	var polygonVertices = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
	var offsets = [new Vector3(-0.5, -0.5, 0), new Vector3(-0.5, 0.5, 0), new Vector3(0.5, 0.5, 0), new Vector3(0.5, -0.5, 0)];
	var doPlanar = false;

	var doesIntersect = false;

	var that = this;
	var doPick = function (event) {
		var x, y;
		var domTarget = that.renderer.domElement;
		if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
			x = event.changedTouches[0].pageX - domTarget.getBoundingClientRect().left;
			y = event.changedTouches[0].pageY - domTarget.getBoundingClientRect().top;
		} else {
			var rect = domTarget.getBoundingClientRect();
			x = event.clientX - rect.left;
			y = event.clientY - rect.top;
		}

		that.camera.getPickRay(x, y, that.renderer.domElement.offsetWidth, that.renderer.domElement.offsetHeight, ray);

		for (var i = 0; i < that._activeEntities.length; i++) {
			var entity = that._activeEntities[i];

			for (var j = 0; j < polygonVertices.length; j++) {
				var vec = polygonVertices[j];
				vec.set(offsets[j]);
				vec.applyPostPoint(entity.transformComponent.worldTransform.matrix);
			}

			if (ray.intersects(polygonVertices, doPlanar, null, true)) {
				return true;
			}
		}

		return false;
	};

	var handlePick = function (event) {
		if (!that.camera || that._activeEntities.length === 0) {
			return false;
		}

		var intersects = doPick(event);

		if (intersects && !doesIntersect) {
			SystemBus.emit('goo.dom3d.enabled', true);
			that.renderer.domElement.style.pointerEvents = 'none';
			doesIntersect = true;
		} else if (!intersects && doesIntersect) {
			SystemBus.emit('goo.dom3d.enabled', false);
			that.renderer.domElement.style.pointerEvents = '';
			doesIntersect = false;
		}
	};

	var drag = false;
	document.addEventListener('mousedown', function (event) {
		if (!that.camera || that._activeEntities.length === 0) {
			return;
		}

		drag = !doPick(event);
	}, false);
	document.addEventListener('mouseup', function (event) {
		if (!that.camera || that._activeEntities.length === 0) {
			return;
		}

		drag = false;

		if (that.playing) {
			handlePick(event);
		}
	}, false);
	document.addEventListener('mousemove', function (event) {
		if (drag || !that.camera || that._activeEntities.length === 0) {
			return;
		}

		if (that.playing) {
			handlePick(event);
		}
	}, false);

	var rootDom = this.rootDom = document.createElement('div');
	this.renderer.domElement.parentNode.insertBefore(rootDom, this.renderer.domElement);

	rootDom.style.position = 'absolute';
	rootDom.style.overflow = 'hidden';
	rootDom.style.webkitUserSelect = 'none';
	rootDom.style.mozUserSelect = 'none';
	rootDom.style.msUserSelect = 'none';
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
	cameraDom.style.webkitUserSelect = 'none';
	cameraDom.style.mozUserSelect = 'none';
	cameraDom.style.msUserSelect = 'none';
	// cameraDom.style.webkitTransformStyle = 'preserve-3d';
	// cameraDom.style.mozTransformStyle = 'preserve-3d';
	cameraDom.style.transformStyle = 'preserve-3d';
	cameraDom.style.width = '100%';
	cameraDom.style.height = '100%';

	rootDom.appendChild(cameraDom);
};

Dom3dSystem.prototype.play = function () {
	this.playing = true;
};

Dom3dSystem.prototype.pause = function () {
};

Dom3dSystem.prototype.resume = Dom3dSystem.prototype.play;

Dom3dSystem.prototype.stop = function () {
	this.playing = false;

	SystemBus.emit('goo.dom3d.enabled', false);
	if (this.renderer.domElement) {
		this.renderer.domElement.style.pointerEvents = '';
	}
};

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
	if (!camera || entities.length === 0) {
		return;
	}

	// lazy init
	if (this.renderer.domElement.parentNode && !this.rootDom) {
		this.init();
	}

	var width = this.renderer.viewportWidth / this.renderer.devicePixelRatio;
	var height = this.renderer.viewportHeight / this.renderer.devicePixelRatio;
	var fov = 0.5 / Math.tan(MathUtils.DEG_TO_RAD * camera.fov * 0.5) * height;

	this.setStyle(this.rootDom, 'perspective', fov + 'px');

	var viewMatrix = camera.getViewMatrix();
	var style = 'translate3d(0,0,' + fov + 'px) ' +
			this.getCameraCSSMatrix(viewMatrix) +
			' translate3d(' + (width / 2) + 'px,' + (height / 2) + 'px, 0)';
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

Dom3dSystem.prototype.cleanup = function () {
	System.prototype.cleanup.apply(this, arguments);

	if (this.rootDom.parentNode !== null) {
		this.rootDom.parentNode.removeChild(this.rootDom);
	}
};

module.exports = Dom3dSystem;
