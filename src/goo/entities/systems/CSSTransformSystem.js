define([
	"goo/entities/systems/System", "goo/renderer/Renderer", "goo/math/Matrix4x4"
], /** @lends CSSTransformSystem */ function (
	System, Renderer, Matrix4x4
) {
	"use strict";

	function CSSTransformSystem() {
		System.call(this, "CSSTransformSystem", ["TransformComponent", "CSSTransformComponent"]);
	}

	CSSTransformSystem.prototype = Object.create(System.prototype);

	CSSTransformSystem.prototype.process = function (entities) {
		var prefixes = ["", "-webkit-", "-moz-", "-ms-", "-o-"];
		var camera = Renderer.mainCamera;

		for (var i in entities) {
			var transformComponent = entities[i].getComponent("TransformComponent");
			var worldTransform = transformComponent.worldTransform;
			var matrix = Matrix4x4.combine(camera.getProjectionMatrix(), worldTransform.matrix);
			var cssTransformComponent = entities[i].getComponent("CSSTransformComponent");
			var domElement = cssTransformComponent.domElement;

			var args = "";

			for (var j = 0; j < 16; j++) {
				args += (j !== 15) ? matrix.data[j] + ", " : matrix.data[j];
			}

			for (var j in prefixes) {
				domElement.style.setProperty(prefixes[j] + "transform", "translate3d(-50%, -50%, 0) matrix3d(" + args + ")");
			}
		}
	};

	return CSSTransformSystem;
});
