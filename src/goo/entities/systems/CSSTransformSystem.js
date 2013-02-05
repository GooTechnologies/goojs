define([
	"goo/entities/systems/System", "goo/renderer/Renderer", "goo/math/Matrix4x4", 'goo/math/MathUtils', 'goo/math/Vector3'
], /** @lends CSSTransformSystem */ function (
	System, Renderer, Matrix4x4, MathUtils, Vector3
) {
	"use strict";

	function CSSTransformSystem(renderer) {
		System.call(this, "CSSTransformSystem", ["TransformComponent", "CSSTransformComponent"]);
		
		this.renderer = renderer;
		this.viewDom = document.querySelector("#view");
		this.containerDom = document.querySelector("#cam1");
		this.containerDom2 = document.querySelector("#cam2");
		
		this.tmpMatrix = new Matrix4x4();
		this.tmpMatrix2 = new Matrix4x4();
		this.tmpVector = new Vector3();
	}

	CSSTransformSystem.prototype = Object.create(System.prototype);

	var epsilon = function(value) {
		return Math.abs(value) < 0.000001 ? 0 : value;
	};

	var getCSSMatrix = function(matrix) {
		var elements = matrix.data;

		return 'translate3d(-50%,-50%,0) matrix3d(' +
			epsilon(elements[0]) + ',' + 
			epsilon(-elements[1]) + ',' + 
			epsilon(elements[2]) + ',' +
			epsilon(elements[3]) + ',' + 
			epsilon(elements[4]) + ',' + 
			epsilon(-elements[5]) + ',' + 
			epsilon(elements[6]) + ',' +
			epsilon(elements[7]) + ',' + 
			epsilon(elements[8]) + ',' +
			epsilon(-elements[9]) + ',' + 
			epsilon(elements[10]) + ',' +
			epsilon(elements[11]) + ',' + 
			epsilon(elements[12]) + ',' + 
			epsilon(-elements[13]) + ',' + 
			epsilon(elements[14]) + ',' +
			epsilon(elements[15]) + 
		') scale3d(1,-1,1)';
	};

	var getCameraCSSMatrix = function(matrix) {
		var elements = matrix.data;

		return 'matrix3d(' + 
			epsilon(elements[0]) + ',' + 
			epsilon(-elements[1]) + ',' + 
			epsilon(elements[2]) + ',' +
			epsilon(elements[3]) + ',' + 
			epsilon(elements[4]) + ',' + 
			epsilon(-elements[5]) + ',' + 
			epsilon(elements[6]) + ',' +
			epsilon(elements[7]) + ',' + 
			epsilon(elements[8]) + ',' +
			epsilon(-elements[9]) + ',' + 
			epsilon(elements[10]) + ',' +
			epsilon(elements[11]) + ',' + 
			epsilon(elements[12]) + ',' + 
			epsilon(-elements[13]) + ',' + 
			epsilon(elements[14]) + ',' +
			epsilon(elements[15]) + ')';
	};

	CSSTransformSystem.prototype.process = function (entities) {
		if (entities.length === 0) {
			return;
		}
		
		var prefixes = ["", "-webkit-", "-moz-", "-ms-", "-o-"];
		var camera = Renderer.mainCamera;

		var fov = 0.5 / Math.tan(MathUtils.DEG_TO_RAD * camera.fov * 0.5) * this.renderer.domElement.offsetHeight;
		
		this.viewDom.style.WebkitPerspective = fov + "px";
		this.viewDom.style.MozPerspective = fov + "px";
		this.viewDom.style.oPerspective = fov + "px";
		this.viewDom.style.perspective = fov + "px";

		this.tmpMatrix.copy(camera.getViewInverseMatrix());
		this.tmpMatrix2.copy(this.tmpMatrix);
		this.tmpMatrix.invert();
		
		this.tmpMatrix.setTranslation(new Vector3(0, 0, fov));
		this.containerDom.style.WebkitTransform = getCameraCSSMatrix(this.tmpMatrix);

		this.tmpMatrix2.e03 = -this.tmpMatrix2.e03;
//		this.tmpMatrix2.e13 = -this.tmpMatrix2.e13;
		this.tmpMatrix2.e23 = -this.tmpMatrix2.e23;
		this.tmpMatrix2.setRotationFromVector(new Vector3(0,0,0));
		this.containerDom2.style.WebkitTransform = getCameraCSSMatrix(this.tmpMatrix2);

		for ( var i in entities) {
			var domElement = entities[i].getComponent("CSSTransformComponent").domElement;
			var style = getCSSMatrix(entities[i].transformComponent.worldTransform.matrix);
			for ( var j in prefixes) {
				domElement.style[prefixes[j] + "transform"] = style;
			}

			if (domElement.parentNode !== this.containerDom2) {
				this.containerDom2.appendChild(domElement);
			}
		}
	};

	return CSSTransformSystem;
});
