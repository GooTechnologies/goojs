define(['goo/math/Vector', 'goo/math/Vector3'],
/** @lends WASDControlScript */
function (Vector, Vector3) {
	"use strict";

	function WASDControlScript (properties) {

		properties = properties || {};

		this.domElement = properties.domElement || document;
		if (properties.domElement) {
			this.domElement.setAttribute('tabindex', -1);
		}

		this.walkSpeed = !isNaN(properties.walkSpeed) ? properties.walkSpeed : 100.0;
		this.crawlSpeed = !isNaN(properties.crawlSpeed) ? properties.crawlSpeed : 10.0;

		this.fwdVector = properties.fwdVector || new Vector3(0, 0, -1);
		this.leftVector = properties.leftVector || new Vector3(-1, 0, 0);

		this.crawlKey = !isNaN(properties.crawlKey) ? properties.crawlKey : 16;
		this.forwardKey = !isNaN(properties.forwardKey) ? properties.forwardKey : 87;
		this.backKey = !isNaN(properties.backKey) ? properties.backKey : 83;
		this.strafeLeftKey = !isNaN(properties.strafeLeftKey) ? properties.strafeLeftKey : 65;
		this.strafeRightKey = !isNaN(properties.strafeRightKey) ? properties.strafeRightKey : 68;

		this.onRun = properties.onRun;

		// XXX: maybe add a lockPlane?

		this.moveState = {
			strafeLeft : 0,
			strafeRight : 0,
			forward : 0,
			back : 0,
			crawling : false
		};

		this.moveVector = new Vector3(0, 0, 0);
		this.calcVector = new Vector3();

		this.setupKeyControls();
	}

	WASDControlScript.prototype.updateMovementVector = function () {
		this.moveVector.x = this.moveState.strafeLeft - this.moveState.strafeRight;
		this.moveVector.z = this.moveState.forward - this.moveState.back;
	};

	WASDControlScript.prototype.updateKeys = function (event, down) {
		if (event.altKey) {
			return;
		}

		var update = false;
		switch (event.keyCode) {
			case this.crawlKey:
				this.moveState.crawling = down;
				break;

			case this.forwardKey:
				this.moveState.forward = down ? 1 : 0;
				update = true;
				break;
			case this.backKey:
				this.moveState.back = down ? 1 : 0;
				update = true;
				break;

			case this.strafeLeftKey:
				this.moveState.strafeLeft = down ? 1 : 0;
				update = true;
				break;
			case this.strafeRightKey:
				this.moveState.strafeRight = down ? 1 : 0;
				update = true;
				break;
		}

		if (update) {
			this.updateMovementVector();
		}
	};

	WASDControlScript.prototype.setupKeyControls = function () {
		var that = this;
		this.domElement.addEventListener('keydown', function (event) {
			that.updateKeys(event, true);
		}, false);

		this.domElement.addEventListener('keyup', function (event) {
			that.updateKeys(event, false);
		}, false);
	};

	WASDControlScript.prototype.run = function (entity) {
		// grab our transformComponent
		var transformComponent = entity.transformComponent;
		if (!transformComponent) {
			return;
		}
		var transform = transformComponent.transform;
		if (Vector.equals(this.moveVector, Vector3.ZERO)) {
			return;
		}

		// direction of movement in local coords
		this.calcVector.set(this.fwdVector.x * this.moveVector.z + this.leftVector.x * this.moveVector.x, this.fwdVector.y * this.moveVector.z
			+ this.leftVector.y * this.moveVector.x, this.fwdVector.z * this.moveVector.z + this.leftVector.z * this.moveVector.x);
		this.calcVector.normalize();

		// move speed for this run...
		var moveMult = entity._world.tpf * (this.moveState.crawling ? this.crawlSpeed : this.walkSpeed);

		// scale by speed
		this.calcVector.mul(moveMult);

		// grab orientation of player
		var orient = transform.rotation;
		// reorient our movement to entity space
		orient.applyPost(this.calcVector);

		// add to our transform
		transform.translation.add(this.calcVector);

		// set our component updated.
		transformComponent.setUpdated();
	};

	return WASDControlScript;
});