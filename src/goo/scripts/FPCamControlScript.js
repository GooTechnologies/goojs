define(['goo/math/Vector', 'goo/math/Vector3'],
/** @lends */
function (Vector, Vector3) {
	"use strict";

	/**
	 * @class Makes an entity controllable by arrow keys. Useful for first person camera applications.
	 *
	 * @param {Object} [properties] Script configuration
	 * @param {Element} [properties.domElement] Element to add key listeners to
	 * @param {number} [properties.walkSpeed=100.0] Regular moving speed.
	 * @param {number} [properties.crawlSpeed=10.0] Crawling moving speed.
	 * @param {Vector3} [properties.fwdVector=Vector3(0,0,-1)] A vector indicating the forward direction.
	 * @param {Vector3} [properties.leftVector=Vector3(-1,0,0)] A vector indicating the left direction.
	 * @param {number} [properties.crawlKey=16] Key code for crawl. (default: Shift)
	 * @param {number} [properties.lookupKey=85] Key code to look up. (default: 'u')
	 * @param {number} [properties.forwardKey=38] Key code to move forward. (default: up)
	 * @param {number} [properties.backKey=40] Key code to move back. (default: down)
	 * @param {number} [properties.turnLeftKey=37] Key code to turn left. (default: left)
	 * @param {number} [properties.turnRightKey=39] Key code to turn right. (default: right)
	 */
	function FPCamControlScript (properties) {

		properties = properties || {};

		this.name = 'FPCamControlScript';

		this.domElement = properties.domElement || document;
		if (properties.domElement) {
			this.domElement.setAttribute('tabindex', -1);
		}

		this.walkSpeed = !isNaN(properties.walkSpeed) ? properties.walkSpeed : 100.0;
		this.crawlSpeed = !isNaN(properties.crawlSpeed) ? properties.crawlSpeed : 10.0;

		this.fwdVector = properties.fwdVector || new Vector3(0, 0, -1);
		this.leftVector = properties.leftVector || new Vector3(-1, 0, 0);

		this.crawlKey = !isNaN(properties.crawlKey) ? properties.crawlKey : 16;
		this.forwardKey = !isNaN(properties.forwardKey) ? properties.forwardKey : 38;
		this.backKey = !isNaN(properties.backKey) ? properties.backKey : 40;
		this.turnLeftKey = !isNaN(properties.turnLeftKey) ? properties.turnLeftKey : 37;
		this.turnRightKey = !isNaN(properties.turnRightKey) ? properties.turnRightKey : 39;
		this.lookUpKey = !isNaN(properties.lookUpKey) ? properties.lookUpKey : 85;
		this.turnSpeed = !isNaN(properties.turnSpeed) ? properties.turnSpeed: 0.05;
		this.waitUntilLookForward = !isNaN(properties.waitUntilLookForward) ? properties.waitUntilLookForward: 1;
		this.XZ = properties.XZ || false;

		this.onRun = properties.onRun;

		// XXX: maybe add a lockPlane?

		this.moveState = {
			turnLeft : 0,
			turnRight : 0,
			forward : 0,
			back : 0,
			lookUp: 0,
			lookForward: 0,
			crawling : false
		};

		this.moveTurn = 0;
		this.moveDirection = 0;
		this.moveSpeed = 0;
		this.moveVector = new Vector3(0, 0, 0);
		this.calcVector = new Vector3();

		this.setupKeyControls();
		console.log('Creating FPCamControlScript');
	}


	FPCamControlScript.prototype.updateMovementVector = function () {
		this.moveTurn = this.moveState.turnRight - this.moveState.turnLeft;
		this.moveSpeed = this.moveState.forward - this.moveState.back;

		// this.moveVector.z = this.moveSpeed*Math.cos(this.moveDirection)

		// this.moveVector.x = this.moveState.strafeLeft - this.moveState.strafeRight;
		// this.moveVector.z = this.moveState.forward - this.moveState.back;
	};

	FPCamControlScript.prototype.updateKeys = function (event, down) {
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

			case this.turnLeftKey:
				this.moveState.turnLeft = down ? 1 : 0;
				update = true;
				break;
			case this.turnRightKey:
				this.moveState.turnRight = down ? 1 : 0;
				update = true;
				break;
			case this.lookUpKey:
				this.moveState.lookUp = down ? 1 : 0;
				this.moveState.lookForward = down ? 0 : this.waitUntilLookForward;
				break;
		}

		if (update) {
			this.updateMovementVector();
		}
	};

	FPCamControlScript.prototype.setupKeyControls = function () {
		var that = this;
		this.domElement.addEventListener('keydown', function (event) {
			that.updateKeys(event, true);
		}, false);

		this.domElement.addEventListener('keyup', function (event) {
			that.updateKeys(event, false);
		}, false);
	};

	FPCamControlScript.prototype.run = function (entity) {
		// grab our transformComponent
		var transformComponent = entity.transformComponent;
		if (!transformComponent) {
			return;
		}
		if (this.moveTurn == 0 && this.moveSpeed == 0 && 
				this.moveState.lookUp == 0 && this.moveState.lookForward == 0) {
			return;
		}


		var transform = transformComponent.transform;
		var orient = transform.rotation;
		orient.toAngles(this.calcVector);
		var yaw = this.calcVector.y;
		var pitch = this.calcVector.x;

		if (this.moveTurn != 0) {
			yaw += this.turnSpeed*this.moveTurn*this.leftVector.x;
		}

		if (this.moveState.lookUp != 0) {
			console.log("looking up");
			pitch += this.turnSpeed;
			if (pitch > Math.PI/2) pitch = Math.PI/2;
		}
		else if (pitch > 0 && this.moveState.lookForward <= entity._world.tpf) {
			console.debug("Returning to face forward");
			pitch -= this.turnSpeed*3;
			if (pitch < 0) pitch = 0;
		}
		else if (this.moveState.lookForward > 0) {
			this.moveState.lookForward-= entity._world.tpf;
			if (this.moveState.lookForward < 0) this.moveState.lookForward = 0
		}

		// Set camera rotation
		orient.fromAngles(
			pitch,
			yaw, 
			this.calcVector.z);


		if (this.moveSpeed != 0) {
			this.moveState.lookForward = entity._world.tpf;

			// direction of movement in local coords
			this.calcVector.set(this.fwdVector.data);

			// move speed for this run...
			var moveMult = entity._world.tpf * (this.moveState.crawling ? this.crawlSpeed : this.walkSpeed) * this.moveSpeed;

			// scale by speed
			this.calcVector.mul(moveMult);

			// grab orientation of player
			var orient = transform.rotation;

			// reorient our movement to entity space
			orient.applyPost(this.calcVector);

			if(this.XZ) {
				this.calcVector.data[1] = 0.0;
			}

			// add to our transform
			transform.translation.add(this.calcVector);
		}
		// set our component updated.
		transformComponent.setUpdated();
		//console.log ('['+ transform.translation.x.toFixed(1) + ',' + transform.translation.z.toFixed(1) + ']');
	};

	return FPCamControlScript;
});