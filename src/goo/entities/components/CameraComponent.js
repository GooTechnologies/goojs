var Component = require('../../entities/components/Component');
var Vector3 = require('../../math/Vector3');
var Camera = require('../../renderer/Camera');
var SystemBus = require('../../entities/SystemBus');



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

		// @ifdef DEBUG
		Object.seal(this);
		// @endif
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
		this.camera._left.set(this.leftVec);
		//! AT: let's prevent scaling or skewing from spilling in the view(projection) matrix
//		transform.matrix.applyPostVector(this.camera._left);
		this.camera._left.applyPost(transform.rotation);

		this.camera._up.set(this.upVec);
//		transform.matrix.applyPostVector(this.camera._up);
		this.camera._up.applyPost(transform.rotation);

		this.camera._direction.set(this.dirVec);
//		transform.matrix.applyPostVector(this.camera._direction);
		this.camera._direction.applyPost(transform.rotation);

		transform.matrix.getTranslation(this.camera.translation);

		// RH: Don't update the frustum only the frame
		// this.camera.update();
		this.camera.onFrameChange();
	};

	CameraComponent.prototype.copy = function (source) {
		this.camera.copy(source.camera);
		this.leftVec.copy(source.leftVec);
		this.upVec.copy(source.upVec);
		this.dirVec.copy(source.dirVec);
		return this;
	};

	CameraComponent.prototype.clone = function () {
		var clone = new CameraComponent(this.camera.clone());

		clone.leftVec.copy(this.leftVec);
		clone.upVec.copy(this.upVec);
		clone.dirVec.copy(this.dirVec);

		return clone;
	};

	CameraComponent.applyOnEntity = function (obj, entity) {
		if (obj instanceof Camera) {
			var cameraComponent = new CameraComponent(obj);
			entity.setComponent(cameraComponent);
			return true;
		}
	};

	module.exports = CameraComponent;