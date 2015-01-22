define([
	'goo/entities/components/Component',
	'goo/math/Vector3',
	'goo/renderer/Camera',
	'goo/entities/SystemBus'
], function (
	Component,
	Vector3,
	Camera,
	SystemBus
) {
	'use strict';

	/**
	 * Holds a camera.
	 * @param {Camera} camera Camera to contain in this component.
	 * @extends Component
	 */
	function CameraComponent (camera) {
		Component.apply(this, arguments);

		this.type = 'CameraComponent';

		/**
		 * The camera contained by the component.
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * Left vector.
		 * @type {Vector3}
		 * @default (-1, 0, 0)
		 */
		this.leftVec = new Vector3(-1, 0, 0);

		/**
		 * Up vector.
		 * @type {Vector3}
		 * @default (0, 1, 0)
		 */
		this.upVec = new Vector3(0, 1, 0);

		/**
		 * Direction vector.
		 * @type {Vector3}
		 * @default (0, 0, -1)
		 */
		this.dirVec = new Vector3(0, 0, -1);

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	CameraComponent.type = 'CameraComponent';

	CameraComponent.prototype = Object.create(Component.prototype);
	CameraComponent.prototype.constructor = CameraComponent;

	CameraComponent.prototype.api = {
		//! AT: the component holds no reference to its entity therefore this method could never stay on the component
		setAsMainCamera: function () {
			SystemBus.emit('goo.setCurrentCamera', {
				camera: this.cameraComponent.camera,
				entity: this
			});
			return this;
		}
	};

	/**
	 * @param {number} axisId Axis to use as up-vector (0=X, 1=Y, 2=Z).
	 */
	CameraComponent.prototype.setUpVector = function (axisId) {
		if (axisId === 0) {
			this.leftVec.setDirect(0, -1, 0);
			this.upVec.setDirect(1, 0, 0);
			this.dirVec.setDirect(0, 0, -1);
		} else if (axisId === 2) {
			this.leftVec.setDirect(-1, 0, 0);
			this.upVec.setDirect(0, 0, 1);
			this.dirVec.setDirect(0, -1, 0);
		} else {
			this.leftVec.setDirect(-1, 0, 0);
			this.upVec.setDirect(0, 1, 0);
			this.dirVec.setDirect(0, 0, -1);
		}
	};

	/**
	 * Updates the contained camera according to a transform (coming from the TransformComponent).
	 * @param {Transform} transform
	 */
	CameraComponent.prototype.updateCamera = function (transform) {
		this.camera._left.setVector(this.leftVec);
		//! AT: let's prevent scaling or skewing from spilling in the view(projection) matrix
//		transform.matrix.applyPostVector(this.camera._left);
		transform.rotation.applyPost(this.camera._left);

		this.camera._up.setVector(this.upVec);
//		transform.matrix.applyPostVector(this.camera._up);
		transform.rotation.applyPost(this.camera._up);

		this.camera._direction.setVector(this.dirVec);
//		transform.matrix.applyPostVector(this.camera._direction);
		transform.rotation.applyPost(this.camera._direction);

		transform.matrix.getTranslation(this.camera.translation);

		// RH: Don't update the frustum only the frame
		// this.camera.update();
		this.camera.onFrameChange();
	};

	CameraComponent.applyOnEntity = function(obj, entity) {
		if (obj instanceof Camera) {
			var cameraComponent = new CameraComponent(obj);
			entity.setComponent(cameraComponent);
			return true;
		}
	};

	return CameraComponent;
});