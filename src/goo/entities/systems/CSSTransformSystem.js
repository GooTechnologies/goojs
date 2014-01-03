define(["goo/entities/systems/System", "goo/renderer/Renderer", "goo/math/Matrix4x4", 'goo/math/MathUtils', 'goo/math/Vector3'], /** @lends */
function (System, Renderer, Matrix4x4, MathUtils, Vector3) {
	"use strict";

	function CSSTransformSystem (renderer) {
		System.call(this, "CSSTransformSystem", ["TransformComponent", "CSSTransformComponent"]);

		this.renderer = renderer;


        if(document.querySelector)
        {
		    this.viewDom = document.querySelector("#view");
		    this.containerDom = document.querySelector("#cam1");
		    this.containerDom2 = document.querySelector("#cam2");
        }

		this.tmpMatrix = new Matrix4x4();
		this.tmpMatrix2 = new Matrix4x4();
		this.tmpVector = new Vector3();
	}

	CSSTransformSystem.prototype = Object.create(System.prototype);

	var epsilon = function (value) {
		return Math.abs(value) < 0.000001 ? 0 : value;
	};

	var prefixes = ["", "-webkit-", "-moz-", "-ms-", "-o-"];
	var setStyle = function (element, property, style) {
		for (var j = 0; j < prefixes.length; j++) {
			element.style[prefixes[j] + property] = style;
		}
	};

	var getCSSMatrix = function (matrix) {
		var elements = matrix.data;


		return 'matrix3d(' + epsilon(elements[0]) + ',' + epsilon(-elements[1]) + ',' + epsilon(elements[2]) + ',' + epsilon(elements[3]) + ','
			+ epsilon(elements[4]) + ',' + epsilon(-elements[5]) + ',' + epsilon(elements[6]) + ',' + epsilon(elements[7]) + ','
			+ epsilon(elements[8]) + ',' + epsilon(-elements[9]) + ',' + epsilon(elements[10]) + ',' + epsilon(elements[11]) + ','
			+ epsilon(elements[12]) + ',' + epsilon(-elements[13]) + ',' + epsilon(elements[14]) + ',' + epsilon(elements[15]) + ')';
	};

	CSSTransformSystem.prototype.process = function (entities) {
		if (entities.length === 0) {
			return;
		}

		var camera = Renderer.mainCamera;

		if (camera == null) {
			return;
		}

		var fov = 0.5 / Math.tan(MathUtils.DEG_TO_RAD * camera.fov * 0.5) * this.renderer.domElement.offsetHeight;
		setStyle(this.viewDom, 'perspective', fov + 'px');

		this.tmpMatrix.copy(camera.getViewInverseMatrix());
		this.tmpMatrix2.copy(this.tmpMatrix);
		this.tmpMatrix.invert();

		this.tmpMatrix.setTranslation(new Vector3(0, 0, fov));
		var style = getCSSMatrix(this.tmpMatrix);
		setStyle(this.containerDom, 'transform', style);

		this.tmpMatrix2.e03 = -this.tmpMatrix2.e03;
		// this.tmpMatrix2.e13 = -this.tmpMatrix2.e13;
		this.tmpMatrix2.e23 = -this.tmpMatrix2.e23;
		this.tmpMatrix2.setRotationFromVector(new Vector3(0, 0, 0));
		style = getCSSMatrix(this.tmpMatrix2);
		setStyle(this.containerDom2, 'transform', style);

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var component = entity.getComponent('CSSTransformComponent');
			var domElement = component.domElement;
			var scale = component.scale;
			scale = [scale, -scale, scale].join(',');

			if(component.faceCamera) {
				entity.transformComponent.worldTransform.matrix.getTranslation(this.tmpVector);
				this.tmpMatrix.copy(camera.getViewInverseMatrix());
				this.tmpMatrix.setTranslation(this.tmpVector);
			} else {
				this.tmpMatrix.copy(entity.transformComponent.worldTransform.matrix);
			}

			style = 'translate3d(-50%,-50%,0) '+getCSSMatrix(this.tmpMatrix) + 'scale3d('+scale+')';
			setStyle(domElement, 'transform', style);

			if (domElement.parentNode !== this.containerDom2) {
				this.containerDom2.appendChild(domElement);
			}
		}
	};

	return CSSTransformSystem;
});
