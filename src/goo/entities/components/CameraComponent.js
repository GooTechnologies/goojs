define([
	'goo/entities/components/Component',
	'goo/renderer/Camera',
	'goo/math/Vector3'
],
/** @lends */
function (
	Component,
	Camera,
	Vector3
) {
	"use strict";

	/**
	 * @class Holds a camera.
	 * @param {Camera} camera Camera to contain in this component
	 */
	function CameraComponent (camera) {
		Component.call( this );
		this.type = 'CameraComponent';

		this.camera = camera || new Camera( 60, window.innerWidth / window.innerHeight, 0.5, 1000 );

		this.leftVec = new Vector3(-1, 0, 0);
		this.upVec   = new Vector3(0, 1, 0);
		this.dirVec  = new Vector3(0, 0, -1);

		this.api = {
			"setProjectionMode" 	: this.camera.setProjectionMode.bind( this.camera ),
			"setFrustumPerspective"	: this.camera.setFrustumPerspective.bind( this.camera ),
			"lookAt" 				: this.camera.lookAt.bind( this.camera )
		};
	}


	CameraComponent.prototype = Object.create(Component.prototype);

	CameraComponent.prototype.componentInit = Component.prototype.init;
	CameraComponent.prototype.init = function( enitiy ) {
		this.componentInit( enitiy );
		this.entity.addAttribute( "@camera" );
	};

	/**
	 * @param {number} axisId Axis to use as up-vector. 0=X, 1=Y, 2=Z
	 */
	CameraComponent.prototype.setUpVector = function (axisId) {
		if (axisId === 0) {
			this.leftVec.setd(0, -1, 0);
			this.upVec.setd(1, 0, 0);
			this.dirVec.setd(0, 0, -1);
		} else if (axisId === 2) {
			this.leftVec.setd(-1, 0, 0);
			this.upVec.setd(0, 0, 1);
			this.dirVec.setd(0, -1, 0);
		} else {
			this.leftVec.setd(-1, 0, 0);
			this.upVec.setd(0, 1, 0);
			this.dirVec.setd(0, 0, -1);
		}
	};

	/**
	 * Updates the contained camera according to a transform (coming from the transformcomponent)
	 * @param {Transform} transform
	 */
	CameraComponent.prototype.updateCamera = function (transform) {
		this.camera._left.setv(this.leftVec);
		transform.matrix.applyPostVector(this.camera._left);

		this.camera._up.setv(this.upVec);
		transform.matrix.applyPostVector(this.camera._up);

		this.camera._direction.setv(this.dirVec);
		transform.matrix.applyPostVector(this.camera._direction);

		transform.matrix.getTranslation(this.camera.translation);

		this.camera.update();
	};

	return CameraComponent;
});