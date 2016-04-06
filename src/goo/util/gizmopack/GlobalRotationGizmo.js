var Gizmo = require('../../util/gizmopack/Gizmo');
var RotationGizmo = require('../../util/gizmopack/RotationGizmo');
var Vector3 = require('../../math/Vector3');
var Matrix3 = require('../../math/Matrix3');
var Transform = require('../../math/Transform');
var Renderer = require('../../renderer/Renderer');
var Ray = require('../../math/Ray');

/**
 * @extends Gizmo
 * @hidden
 */
function GlobalRotationGizmo() {
	Gizmo.call(this, 'GlobalRotationGizmo');

	this._rotation = new Matrix3();
	this._direction = new Vector3();

	//TODO: create a function that does this sort of thing
	this.snap = false;
	this._accumulatedRotation = new Vector3();
	this._oldAngle = new Vector3();

	this.compileRenderables();
}

GlobalRotationGizmo.prototype = Object.create(Gizmo.prototype);
GlobalRotationGizmo.prototype.constructor = GlobalRotationGizmo;

(function () {
	var worldCenter = new Vector3();
	var pickedPoint = new Vector3();
	var rotationDirection = new Vector3();
	var axis = new Vector3();
	var ray = new Ray();
	var crossResult = new Vector3();

	GlobalRotationGizmo.prototype.activate = function (props) {
		Gizmo.prototype.activate.call(this, props);

		if (this._activeHandle.axis < 3) {
			// Get rotation axis
			axis.copy([Vector3.UNIT_X, Vector3.UNIT_Y, Vector3.UNIT_Z][this._activeHandle.axis]);

			// Get rotation center
			worldCenter.copy(Vector3.ZERO);
			worldCenter.applyPostPoint(this.transform.matrix);

			// Get picked point in world space (sort of)
			Renderer.mainCamera.getPickRay(
				props.x,
				props.y,
				1,
				1,
				ray
			);
			pickedPoint.copy(ray.origin).sub(worldCenter);
			var d = pickedPoint.length() * 0.9;
			pickedPoint.copy(ray.direction).scale(d).add(ray.origin);

			// Get vector from center to picked point, cross it with rotation axis and get drag direction
			rotationDirection.copy(pickedPoint).sub(worldCenter);

			crossResult.copy(axis).cross(rotationDirection);
			rotationDirection.copy(crossResult);

			rotationDirection.add(pickedPoint);
			Renderer.mainCamera.getScreenCoordinates(
				rotationDirection,
				1,
				1,
				this._direction
			);
			this._direction.subDirect(props.x, props.y, 0);

			this._direction.z = 0;
			this._direction.normalize();
		}
	};
})();

GlobalRotationGizmo.prototype.process = RotationGizmo.prototype.process;

GlobalRotationGizmo.prototype._rotateOnScreen = RotationGizmo.prototype._rotateOnScreen;

GlobalRotationGizmo.prototype._applyRotation = function () {
	this.transform.rotation.mul2(
		this._rotation,
		this.transform.rotation
	);
};

GlobalRotationGizmo.prototype._rotateOnAxis = RotationGizmo.prototype._rotateOnAxis;

(function () {
	var transform = new Transform();

	/**
	 * Update the transform of the provided renderable.
	 * @param renderable
	 */
	GlobalRotationGizmo.prototype.updateRenderableTransform = function (renderable) {
		transform.copy(this.transform);
		transform.rotation.setIdentity();
		transform.update();

		renderable.transform.matrix.mul2(
			transform.matrix,
			renderable.transform.matrix
		);
	};
})();

GlobalRotationGizmo.prototype.compileRenderables = RotationGizmo.prototype.compileRenderables;

module.exports = GlobalRotationGizmo;