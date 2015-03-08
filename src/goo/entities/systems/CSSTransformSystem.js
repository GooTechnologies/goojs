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
	function CSSTransformSystem(renderer) {
		System.call(this, 'CSSTransformSystem', ['TransformComponent', 'CSSTransformComponent']);

		this.camera = null;
		this.renderer = renderer;

		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			this.camera = newCam.camera;
		}.bind(this));

        if (document.querySelector) {
		    this.viewDom = document.querySelector('#view');
		    this.containerDom = document.querySelector('#cam1');
		    this.containerDom2 = document.querySelector('#cam2');
        }
	}

	var tmpMatrix = new Matrix4x4();
	var tmpMatrix2 = new Matrix4x4();
	var tmpVector = new Vector3();

	CSSTransformSystem.prototype = Object.create(System.prototype);
	CSSTransformSystem.prototype.constructor = CSSTransformSystem;

	var prefixes = ['', '-webkit-'];
	var setStyle = function (element, property, style) {
		for (var j = 0; j < prefixes.length; j++) {
			element.style[prefixes[j] + property] = style;
		}
	};

	var getCSSMatrix = function (matrix) {
		var elements = matrix.data;

		return 'matrix3d('
			+ elements[0] + ',' + (-elements[1]) + ',' + elements[2] + ',' + elements[3] + ','
			+ elements[4] + ',' + (-elements[5]) + ',' + elements[6] + ',' + elements[7] + ','
			+ elements[8] + ',' + (-elements[9]) + ',' + elements[10] + ',' + elements[11] + ','
			+ elements[12] + ',' + (-elements[13]) + ',' + elements[14] + ',' + elements[15] + ')';
	};

	CSSTransformSystem.prototype.process = function (entities) {
		if (!this.camera) {
			return;
		}

		var fov = 0.5 / Math.tan(MathUtils.DEG_TO_RAD * this.camera.fov * 0.5) * this.renderer.domElement.offsetHeight;
		setStyle(this.viewDom, 'perspective', fov + 'px');

		var viewInverseMatrix = this.camera.getViewInverseMatrix();
		var style;

		tmpMatrix.copy(viewInverseMatrix);
		tmpMatrix.invert();
		tmpMatrix.setTranslation(tmpVector.setDirect(0, 0, fov));
		style = getCSSMatrix(tmpMatrix);
		setStyle(this.containerDom, 'transform', style);

		tmpMatrix2.e03 = -viewInverseMatrix.e03;
		tmpMatrix2.e13 = viewInverseMatrix.e13;
		tmpMatrix2.e23 = -viewInverseMatrix.e23;
		style = getCSSMatrix(tmpMatrix2);
		setStyle(this.containerDom2, 'transform', style);

		for (var i = 0, l = entities.length; i < l; i++) {
			var entity = entities[i];
			var component = entity.getComponent('CSSTransformComponent');

			if (!entity.transformComponent._wasUpdated && !component.faceCamera) {
				continue;
			}

			var domElement = component.domElement;
			var scale = component.scale;
			var scaleStr = scale + ',' + (-scale) + ',' + scale;

			if (component.faceCamera) {
				entity.transformComponent.worldTransform.matrix.getTranslation(tmpVector);
				tmpMatrix.copy(viewInverseMatrix);
				tmpMatrix.setTranslation(tmpVector);
			} else {
				tmpMatrix.copy(entity.transformComponent.worldTransform.matrix);
			}

			style = 'translate3d(-50%,-50%,0) ' + getCSSMatrix(tmpMatrix) + ' scale3d(' + scaleStr + ')';
			setStyle(domElement, 'transform', style);

			if (domElement.parentNode !== this.containerDom2) {
				this.containerDom2.appendChild(domElement);
			}
		}
	};

	return CSSTransformSystem;
});
