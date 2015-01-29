define([
	'goo/math/Vector'
], function (
	Vector
) {
	'use strict';

	/**
	 * Vector with 3 components. Used to store 3D translation and directions. It also contains common 3D Vector operations. Creates a new Vector3 by passing in either a current Vector3, number Array, or a set of three numbers.
	 * @extends Vector
	 * @param {Vector3|number[]|...number} arguments Initial values for the components.
	 * @example
	 * // Passing in three numbers
	 * var v1 = new Vector3(1, 2, 3);
	 *
	 * // Passing in an existing Vector3
	 * var v2 = new Vector3(v1); // v2 == (1, 2, 3)
	 *
	 * // Passing in a number Array
	 * var v3 = new Vector3([4, 5, 6]);
	 *
	 * // Passing in no arguments
	 * var v4 = new Vector3(); // v4 == (0, 0, 0)
	 */
	function Vector3() {
		Vector.call(this, 3);

		if (arguments.length !== 0) {
			Vector.prototype.set.apply(this, arguments);
		}

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	Vector3.prototype = Object.create(Vector.prototype);
	Vector3.prototype.constructor = Vector3;

	Vector.setupAliases(Vector3.prototype,[['x', 'u', 'r'], ['y', 'v', 'g'], ['z', 'w', 'b']]);

	/* ====================================================================== */

	/**
	* Vector3 representing Zero Axis: (0, 0, 0)
	* @type {Vector3}
	* @example
	* var oldValue = new Vector3(5, 2, 1);
	* oldValue.setVector(Vector3.ZERO); // oldValue == (0, 0, 0)
	*/
	Vector3.ZERO = new Vector3(0, 0, 0);

	/**
	* Vector3 representing All Axis: (1, 1, 1)
	* @type {Vector3}
	* @example
	* var v1 = Vector3.ONE.clone(); // v1 == (1, 1, 1)
	*/
	Vector3.ONE = new Vector3(1, 1, 1);

	/**
	* Vector3 representing X Axis(right): (1, 0, 0)
	* @type {Vector3}
	* @example
	* // speed we want to strafe left or right
	* var speed = 5;
	* // direction to strafe
	* var strafeSpeed = 0;
	* // if key 'a' is pressed
	* if(KeyInput.getKey('a')){
	*	strafeSpeed -= speed;
	* }
	* // if key 'd' is pressed
	* if(KeyInput.getKey('d')){
	*	strafeSpeed += speed;
	* }
	*
	* // set strafeVector using Vector3.UNIT_X
	* // strafeVector.x is either 0, speed, or -speed, depending on the keys pressed
	* var strafeVector = Vector3.mul(Vector3.UNIT_X, strafeSpeed);
	*/
	Vector3.UNIT_X = new Vector3(1, 0, 0);

	/**
	* Vector3 representing Y Axis(up): (0, 1, 0)
	* @type {Vector3}
	* @example
	* // height we want to jump
	* var jumpHeight = 2.0;
	* // gravity pulling us down
	* var gravity = -9.8;
	* // the calculated vertical jump impulse
	* var jumpVelocity = Math.sqrt(2*jumpHeight*gravity);
	*
	* // set jumpVector using Vector3.UNIT_Y
	* var jumpVector = Vector3.mul(Vector3.UNIT_Y, jumpVelocity); // jumpVector == (0, jumpVelocity, 0)
	*/
	Vector3.UNIT_Y = new Vector3(0, 1, 0);

	/**
	* Vector3 representing Z Axis(forward): (0, 0, 1)
	* @type {Vector3}
	* @example
	* // speed we want to move forward
	* var fwd_speed = 5;
	* // speed we want to move back
	* var bck_speed = -3.5;
	* // speed to move
	* var moveSpeed = 0.0;
	* // if key 'w' is pressed
	* if(KeyInput.getKey('w')){
	*	moveSpeed = fwd_speed;
	* }
	* // if key 's' is pressed
	* if(KeyInput.getKey('s')){
	*	moveSpeed = bck_speed;
	* }
	*
	* // set moveVector, using Vector3.UNIT_Z
	* // moveVector.z is either 0, fwd_speed, or bck_speed, depending on the keys pressed
	* var moveVector = Vector3.mul(Vector3.UNIT_Z, moveSpeed);
	*/
	Vector3.UNIT_Z = new Vector3(0, 0, 1);

	// general purpose vector for holding intermediate data that has no better than 'tmpVec'
	var tmpVec = new Vector3();

	/* ====================================================================== */

	/**
	 * Adds 'lhs' and 'rhs' and stores the result in 'target'. If target is not supplied, a new Vector3 object is created and returned. Equivalent of 'return (target = lhs + rhs);'.
	 * @param {Vector3|number[]|number} lhs Vector3, array of numbers or a single number on the left-hand side. For single numbers, the value is repeated for
	 *            every component.
	 * @param {Vector3|number[]|number} rhs Vector3, array of numbers or a single number on the right-hand side. For single numbers, the value is repeated for
	 *            every component.
	 * @param {Vector3} [target] Vector3 to store the result. If one is not supplied, a new Vector3 object is created.
	 * @returns {Vector3} The target Vector3 passed in, or a new Vector3 object.
	 * @example
	 * // Adds two Vector3 with no target, returns a new Vector3 object as the result
	 * var v1 = new Vector3(1, 2, 3);
	 * var v2 = new Vector3(4, 5, 6);
	 * var r1 = Vector3.add(v1, v2); // r1 == (5, 7, 9)
	 *
	 * // Adds a number Array and a Vector3 with a target Vector3 to store the result
	 * var a1 = [1, 2, 3];
	 * var v1 = new Vector3(4, 5, 6);
	 * var r1 = new Vector3(); // r1 == (0, 0, 0)
	 * Vector3.add(a1, v1, r1); // r1 == (5, 7, 9)
	 *
	 * // Adds a number to a Vector3, using that same Vector3 as the target to store the result
	 * var v1 = new Vector3(1, 2, 3);
	 * Vector3.add(5, v1, v1); // v1 == (6, 7, 8)
	 */
	Vector3.add = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector3();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.data[0] = ldata[0] + rdata[0];
		target.data[1] = ldata[1] + rdata[1];
		target.data[2] = ldata[2] + rdata[2];

		return target;
	};

	/**
	 * Optimized for Vector3 objects. Adds 'lhs' and 'rhs' and stores the result in 'target'. If target is not supplied, a new Vector3 object is created and returned.
	 * @deprecated Deprecated as of v0.12.x and scheduled for removal in 0.14.0
	 * @param {Vector3} lhs Vector3 on the left-hand side.
	 * @param {Vector3} rhs Vector3 on the right-hand side.
	 * @param {Vector3} target Vector3 to store the result. If one is not supplied, a new Vector3 object is created.
	 * @returns {Vector3} The target Vector3 passed in, or a new Vector3 object.
	 * @example
	 * // Adds two Vector3 objects and returns a new Vector3 object as the result
	 * var v1 = new Vector3(1, 2, 3);
	 * var v2 = new Vector3(4, 5, 6);
	 * var v3 = Vector3.addv(v1, v2); // v3 == (5, 7, 9)
	 *
	 * // Adds two Vector3 objects, and stores the result in the target Vector3
	 * var v1 = new Vector3(2, 4, 6);
	 * var v2 = new Vector3(4, 6, 8);
	 * Vector3.addv(v1, v2, v1); // v1 == (6, 10, 14)
	 */
	Vector3.addv = addWarning(
		function (lhs, rhs, target) {
			if (!target) {
				target = new Vector3();
			}

			target.data[0] = lhs.data[0] + rhs.data[0];
			target.data[1] = lhs.data[1] + rhs.data[1];
			target.data[2] = lhs.data[2] + rhs.data[2];

			return target;
		},
		'The static method .addv is deprecated; please use the instance method .addVector instead'
	);

	/**
	 * Adds 'rhs' to the current Vector3. Equivalent to 'return (this += rhs);'.
	 * @param {Vector3|number[]|number} rhs Vector3, Array of numbers, or single number. For a single number, the value is repeated for
	 *            every component.
	 * @returns {Vector3} Self for chaining.
	 * @example
	 * // Passing in an existing Vector3
	 * var v1 = new Vector3(1, 2, 3);
	 * var v2 = new Vector3(4, 5, 6);
	 * v2.add(v1); // v2 == (5, 7, 9)
	 *
	 * // Passing in a number Array
	 * var v3 = new Vector3(); // v3 == (0, 0, 0)
	 * v3.add([1,2,3]); // (1, 2, 3)
	 *
	 * // Passing in a number
	 * var v4 = new Vector3(); // v4 == (0, 0, 0)
	 * v4.add(5); // v4 == (5, 5, 5)
	 */
	Vector3.prototype.add = function (rhs) {
		return Vector3.add(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Subtracts 'rhs' from 'lhs' and stores the result in 'target'.  If target is not supplied, a new Vector3 object is created and returned.  Equivalent of 'return (target = lhs - rhs);'.
	 * @param {Vector3|number[]|number} lhs Vector3, array of numbers or single number on the left-hand side. For single numbers, the value is repeated for
	 *            every component.
	 * @param {Vector3|number[]|number} rhs Vector3, array of numbers or single number on the right-hand side. For single numbers, the value is repeated for
	 *            every component.
	 * @param {Vector3} [target] Vector3 to store the result.  If one is not supplied, a new Vector3 object is created.
	 * @returns {Vector3} The target Vector3 passed in, or a new Vector3 object.
	 * @example
	 * // Subtracts Vector3 'v2' from Vector3 'v1', returns a new Vector3 object as the result
	 * var v1 = new Vector3(1, 2, 3);
	 * var v2 = new Vector3(4, 5, 6);
	 * var r1 = Vector3.sub(v1, v2); // r1 == (-3, -3, -3)
	 *
	 * // Subtracts a Vector3 'v1' from a number Array 'a1' with a target Vector3 to store the result
	 * var a1 = [4, 5, 6];
	 * var v1 = new Vector3(1, 2, 3);
	 * var r1 = new Vector3(); // r1 == (0, 0, 0)
	 * Vector3.sub(a1, v1, r1); // r1 == (3, 3, 3)
	 *
	 * // Subtracts a number from a Vector3, using that same Vector3 as the target to store the result
	 * var v1 = new Vector3(1, 2, 3);
	 * Vector3.sub(v1, 5, v1); // v1 == (-4, -3, -2)
	 */
	Vector3.sub = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector3();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.data[0] = ldata[0] - rdata[0];
		target.data[1] = ldata[1] - rdata[1];
		target.data[2] = ldata[2] - rdata[2];

		return target;
	};

	/**
	 * Optimized for Vector3 objects.  Subtracts 'rhs' from 'lhs' and stores the result in 'target'.  If target is not supplied, a new Vector3 object is created and returned.
	 * @deprecated Deprecated as of v0.12.x and scheduled for removal in 0.14.0
	 * @param {Vector3} lhs Vector3 on the left-hand side.
	 * @param {Vector3} rhs Vector3 on the right-hand side.
	 * @param {Vector3} target Vector3 to store the result.  If one is not supplied, a new Vector3 object is created.
	 * @returns {Vector3} The target Vector3 passed in, or a new Vector3 object.
	 * @example
	 * // Subtracts two Vector3: v2 from v1, and returns a new Vector3 object as the result
	 * var v1 = new Vector3(1, 2, 3);
	 * var v2 = new Vector3(4, 5, 6);
	 * var v3 = Vector3.subv(v1, v2); // v3 == (-3, -3, -3)
	 *
	 * // Subtracts two Vector3: v2 from v1, and stores the result in the target Vector3: v1
	 * var v1 = new Vector3(2, 4, 6);
	 * var v2 = new Vector3(4, 6, 8);
	 * Vector3.subv(v1, v2, v1); // v1 == (-2, -2, -2)
	 */
	Vector3.subv = addWarning(
		function (lhs, rhs, target) {
			if (!target) {
				target = new Vector3();
			}

			target.data[0] = lhs.data[0] - rhs.data[0];
			target.data[1] = lhs.data[1] - rhs.data[1];
			target.data[2] = lhs.data[2] - rhs.data[2];

			return target;
		},
		'The static method .subv is deprecated; please use the instance method .subVector instead'
	);

	/**
	 * Subtracts 'rhs' from the current Vector3. Equivalent of 'return (this -= rhs);'.
	 * @param {Vector3|number[]|number} rhs Vector3, array of numbers or a single number on the right-hand side. For single number, the value is repeated for
	 *            every component.
	 * @returns {Vector3} Self for chaining.
	 * @example
	 * // Passing in an existing Vector3
	 * var v1 = new Vector3(1, 2, 3);
	 * var v2 = new Vector3(4, 5, 6);
	 * v2.sub(v1); // v2 == (3, 3, 3)
	 *
	 * // Passing in a number Array
	 * var v3 = new Vector3(); // v3 == (0, 0, 0)
	 * v3.sub([1,2,3]); // v3 == (-1, -2, -3)
	 *
	 * // Passing in a number
	 * var v4 = new Vector3(); // v4 == (0, 0, 0)
	 * v4.sub(5); // v4 == (-5, -5, -5)
	 */
	Vector3.prototype.sub = function (rhs) {
		return Vector3.sub(this, rhs, this);
	};

	/* ====================================================================== */
	/**
	 * Performs component-wise negation of the vector
	 * @returns {Vector3} Self for chaining
	 */
	Vector3.prototype.invert = function () {
		this.data[0] = 0.0 - this.data[0];
		this.data[1] = 0.0 - this.data[1];
		this.data[2] = 0.0 - this.data[2];
		return this;
	};

	/* ====================================================================== */

	/**
	 * Multiplies 'lhs' and 'rhs' and stores the result in 'target'.  If target is not supplied, a new Vector3 object is created and returned. Equivalent of 'return (target = lhs * rhs);'.
	 * @param {Vector3|number[]|number} lhs Vector3, array of numbers or a single number on the left-hand side. For single numbers, the value is repeated for
	 *            every component.
	 * @param {Vector3|number[]|number} rhs Vector3, array of numbers or a single number on the right-hand side. For single numbers, the value is repeated for
	 *            every component.
	 * @param {Vector3} [target] Target Vector3 for storage.  If one is not supplied, a new Vector3 object is created.
	 * @returns {Vector3} The target Vector3 passed in, or a new Vector3 object.
	 * @example
	 * // Multiplies two Vector3 with no target, returns a new Vector3 object as the result
	 * var v1 = new Vector3(1, 2, 3);
	 * var v2 = new Vector3(4, 5, 6);
	 * var r1 = Vector3.mul(v1, v2); // r1 == (4, 10, 18)
	 *
	 * // Multiplies a number Array and a Vector3 with a target Vector3 to store the result
	 * var a1 = [1, 2, 3];
	 * var v1 = new Vector3(4, 5, 6);
	 * var r1 = new Vector3(); // r1 == (0, 0, 0)
	 * Vector3.mul(a1, v1, r1); // r1 == (4, 10, 18)
	 *
	 * // Multiplies a Vector3 by a number, using that same Vector3 as the target to store the result
	 * var v1 = new Vector3(1, 2, 3);
	 * Vector3.mul(v1, 5, v1); // v1 == (5, 10, 15)
	 */
	Vector3.mul = function (lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		if (typeof lhs === 'number') {
			var rdata = rhs.data || rhs;

			target.data[0] = lhs * rdata[0];
			target.data[1] = lhs * rdata[1];
			target.data[2] = lhs * rdata[2];
		} else if (typeof rhs === 'number') {
			var ldata = lhs.data || lhs;

			target.data[0] = ldata[0] * rhs;
			target.data[1] = ldata[1] * rhs;
			target.data[2] = ldata[2] * rhs;
		} else {
			var ldata = lhs.data || lhs;
			var rdata = rhs.data || rhs;

			target.data[0] = ldata[0] * rdata[0];
			target.data[1] = ldata[1] * rdata[1];
			target.data[2] = ldata[2] * rdata[2];
		}

		return target;
	};

	/**
	 * Multiplies the current Vector3 by 'rhs'.  Equivalent of 'return (this *= rhs);'.
	 * @param {Vector3|number[]|number} rhs Vector3, array of numbers or a single number on the right-hand side. For single numberss, the value is repeated for
	 *            every component.
	 * @returns {Vector3} Self for chaining.
	 * @example
	 * // Passing in an existing Vector3
	 * var v1 = new Vector3(1, 2, 3);
	 * var v2 = new Vector3(4, 5, 6);
	 * v2.mul(v1); // v2 == (4, 10, 18)
	 *
	 * // Passing in a number Array
	 * var v3 = new Vector3(2, 4, 6);
	 * v3.mul([1,2,3]); // v3 == (2, 8, 18)
	 *
	 * // Passing in a number
	 * var v4 = new Vector3(1, 2, 3);
	 * v4.mul(5); // v4 == (5, 10, 15)
	 */
	Vector3.prototype.mul = function (rhs) {
		return Vector3.mul(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Divides 'lhs' by 'rhs' and stores the result in 'target'.  If target is not supplied, a new Vector3 object is created and returned.  Equivalent of 'return (target = lhs / rhs);'.
	 * @param {Vector3|number[]|number} lhs Vector3, array of numbers or a single number on the left-hand side. For single numbers, the value is repeated for
	 *            every component.
	 * @param {Vector3|number[]|number} rhs Vector3, array of numbers or a single number on the right-hand side. For single numbers, the value is repeated for
	 *            every component.
	 * @param {Vector3} [target] Target Vector3 for storage.  If one is not supplied, a new Vector3 object is created.
	 * @returns {Vector3} The target Vector3 passed in, or a new Vector3 object.
	 * @example
	 * // Divides two Vector3: v1 by v2, returns a new Vector3 object as the result
	 * var v1 = new Vector3(2, 4, 8);
	 * var v2 = new Vector3(1, 2, 4);
	 * var r1 = Vector3.div(v1, v2); // r1 == (2, 2, 2)
	 *
	 * // Divides a number Array by a Vector3 with a target Vector3 to store the result
	 * var a1 = [5, 10, 15];
	 * var v1 = new Vector3(5, 2, 3);
	 * var r1 = new Vector3(); // r1 == (0, 0, 0)
	 * Vector3.div(a1, v1, r1); // r1 == (1, 5, 5)
	 *
	 * // Divides a Vector3 by a number, using that same Vector3 as the target to store the result
	 * var v1 = new Vector3(5, 10, 15);
	 * Vector3.div(v1, 5, v1); // v1 == (1, 2, 3)
	 */
	Vector3.div = function (lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		if (typeof lhs === 'number') {
			var rdata = rhs.data || rhs;

			target.data[0] = lhs / rdata[0];
			target.data[1] = lhs / rdata[1];
			target.data[2] = lhs / rdata[2];
		} else if (typeof rhs === 'number') {
			var irhs = 1 / rhs;
			var ldata = lhs.data || lhs;

			target.data[0] = ldata[0] * irhs;
			target.data[1] = ldata[1] * irhs;
			target.data[2] = ldata[2] * irhs;
		} else {
			var ldata = lhs.data || lhs;
			var rdata = rhs.data || rhs;

			target.data[0] = ldata[0] / rdata[0];
			target.data[1] = ldata[1] / rdata[1];
			target.data[2] = ldata[2] / rdata[2];
		}

		return target;
	};

	/**
	 * Divides the current Vector3 by 'rhs'.  Equivalent of 'return (this /= rhs);'.
	 * @param {Vector3|number[]|number} rhs Vector3, array of numbers or single number on the right-hand side. For a single number, the value is repeated for
	 *            every component.
	 * @returns {Vector3} Self for chaining.
	 * @example
	 * // Passing in an existing Vector3
	 * var v1 = new Vector3(4, 2, 3);
	 * var v2 = new Vector3(4, 4, 12);
	 * v2.div(v1); // v2 == (1, 2, 4)
	 *
	 * // Passing in a number Array
	 * var v3 = new Vector3(4, 8, 12);
	 * v3.div([2, 8, 4]); // v3 == (2, 1, 3)
	 *
	 * // Passing in a number
	 * var v4 = new Vector3(15, 25, 5);
	 * v4.div(5); // v4 == (3, 5, 1)
	 */
	Vector3.prototype.div = function (rhs) {
		return Vector3.div(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Computes the dot product between 'lhs' and 'rhs'.  Equivalent of 'return lhs•rhs;'.
	 * @param {Vector3|number[]|number} lhs Vector3, array of numbers or a single number on the left-hand side. For single numbers, the value is repeated for
	 *            every component.
	 * @param {Vector3|number[]|number} rhs Vector3, array of numbers or a single number on the left-hand side. For single numbers, the value is repeated for
	 *            every component.
	 * @returns {number} Dot product number.
	 * @example
	 * // Passing in two Vector3
	 * var v1 = new Vector3(0, 1.0, 0);
	 * var v2 = new Vector3(0, -0.5, 0);
	 * var r1 = Vector3.dot(v1, v2); // r1 == -0.5
	 *
	 * // Passing in a Vector3 and a number Array
	 * var v1 = new Vector3(0, 1.0, 0);
	 * var r1 = Vector3.dot(v1, [0, 0.5, 0]); // r1 == 0.5
	 *
	 * // Passing in a Vector3 and a number
	 * var v1 = new Vector3(0, 1.0, 0);
	 * var r1 = Vector3.dot(v1, 1.0); // r1 == 1.0
	 */
	Vector3.dot = function (lhs, rhs) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs, rhs];
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		return ldata[0] * rdata[0] +
			ldata[1] * rdata[1] +
			ldata[2] * rdata[2];
	};

	/**
	 * Computes the dot product between the current Vector3 and 'rhs'. Equivalent of 'return this•rhs;'.
	 * @param {Vector3|number[]|number} rhs Vector3, array of numbers or a single number on the left-hand side. For single numbers, the value is repeated for
	 *            every component.
	 * @returns {number} Dot product.
	 * @example
	 * // Passing in an existing Vector3
	 * var v1 = new Vector3(0, 1.0, 0);
	 * var v2 = new Vector3(0, -0.5, 0);
	 * var r1 = v1.dot(v2); // r1 == -0.5
	 *
	 * // Passing in a number Array
	 * var v3 = new Vector3(0, 1.0, 0);
	 * var r1 = v3.dot([0, 0.5, 0]); // r1 == 0.5
	 *
	 * // Passing in a number
	 * var v4 = new Vector3(0, 1.0, 0);
	 * var r1 = v4.dot(1.0); // r1 == 1.0
	 */
	Vector3.prototype.dot = function (rhs) {
		return Vector3.dot(this, rhs);
	};

	//! AT: undocumented, used in only one place in the engine
	Vector3.dotv = addWarning(
		function (lhs, rhs) {
			var ldata = lhs.data;
			var rdata = rhs.data;

			return ldata[0] * rdata[0] +
				ldata[1] * rdata[1] +
				ldata[2] * rdata[2];
		},
		'The static method .dotv is deprecated; please use the instance method .dotVector instead'
	);

	/**
	 * Computes the dot product between the current vector and 'rhs'.
	 * @param {Vector3} rhs
	 * @returns {number}
	 */
	Vector3.prototype.dotVector = function (rhs) {
		var ldata = this.data;
		var rdata = rhs.data;

		return ldata[0] * rdata[0] +
			ldata[1] * rdata[1] +
			ldata[2] * rdata[2];
	};

	/* ====================================================================== */

	/**
	 * Computes the cross product between 'lhs' and 'rhs' and stores the result in 'target'.  If target is not supplied, a new Vector3 object is created and returned.  Equivalent of 'return (target = lhs x rhs);'.
	 * @param {Vector3|number[]} lhs Vector3 or array of numbers on the left-hand side.
	 * @param {Vector3|number[]} rhs Vector3 or array of numbers on the right-hand side.
	 * @param {Vector3} [target] Target Vector3 for storage.  If one is not supplied, a new Vector3 object is created.
	 * @returns {Vector3} The target Vector3 passed in, or a new Vector3 object.
	 * @example
	 * // Passing in two Vector3, returns a new Vector3 object as the result
	 * var v1 = new Vector3(0, 1, 0);
	 * var v2 = new Vector3(1, 0, 0);
	 * var cross = Vector3.cross(v1, v2); // cross == (0, 0, -1)
	 *
	 * // Passing in a Vector3 and a number Array, using the same Vector3 to store the results
	 * var v3 = new Vector3(0, 0, -1);
	 * Vector3.cross(v3, [0, -1, 0], v3); // v3 == (-1, 0, 0)
	 */
	Vector3.cross = function (lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		var x = rdata[2] * ldata[1] - rdata[1] * ldata[2];
		var y = rdata[0] * ldata[2] - rdata[2] * ldata[0];
		var z = rdata[1] * ldata[0] - rdata[0] * ldata[1];

		target.data[0] = x;
		target.data[1] = y;
		target.data[2] = z;

		return target;
	};

	/**
	 * Computes the cross product between the current Vector3 and 'rhs'.  The current Vector3 becomes the result.  Equivalent of 'return (this = this x rhs);'.
	 * @param {Vector3|number[]} rhs Vector3 or array of numbers on the right-hand side.
	 * @returns {Vector3} Self for chaining.
	 * @example
	 * // Passing in a Vector3
	 * var v1 = new Vector3(0, 1, 0);
	 * var v2 = new Vector3(0, 0, -1);
	 * v1.cross(v2); // v1 == (-1, 0, 0)
	 *
	 * // Passing in an array
	 * var v3 = new Vector3(1, 0, 0);
	 * v3.cross([0, 1, 0]); // v3 == (0, 0, 1)
	 */
	Vector3.prototype.cross = function (rhs) {
		return Vector3.cross(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Linearly interpolates between the current Vector3 and an 'end' Vector3.  The current Vector3 is modified.
	 * @param {Vector3} end End Vector3.
	 * @param {number} factor Interpolation factor between 0.0 and 1.0.
	 * @returns {Vector3} Self for chaining.
	 * @example
	 * var goal = new Vector3(5, 0, 0);
	 *
	 * // In an entities  {@link ScriptComponent}
	 * function run(entity, tpf){
	 *     // entity.transformComponent.transform.translation is a Vector3 object
	 *     entity.transformComponent.transform.translation.lerp(v2, tpf);
	 *     entity.transformComponent.setUpdated();
	 * }
	 */
	Vector3.prototype.lerp = function (end, factor) {
		this.data[0] = (1.0 - factor) * this.data[0] + factor * end.data[0];
		this.data[1] = (1.0 - factor) * this.data[1] + factor * end.data[1];
		this.data[2] = (1.0 - factor) * this.data[2] + factor * end.data[2];

		return this;
	};

	/**
	 * Reflects a vector relative to the plane obtained from the normal parameter.
 	 * @param {Vector3} normal Defines the plane that reflects the vector. Assumed to be of unit length.
	 * @returns {Vector3} Self to allow chaining
	 */
	Vector3.prototype.reflect = function (normal) {
		tmpVec.copy(normal);
		tmpVec.scale(2 * this.dot(normal));
		this.subVector(tmpVec);
		return this;
	};

	/* ====================================================================== */

	function addWarning(method, warning) {
		var warned = false;
		return function () {
			if (!warned) {
				warned = true;
				console.warn(warning);
			}
			return method.apply(this, arguments);
		};
	}

	// Performance methods
	/**
	 * Sets the vector's values from 3 numeric arguments
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} this for chaining
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * v1.setDirect(2, 4, 6); // v1 == (2, 4, 6)
	 */
	Vector3.prototype.setDirect = function (x, y, z) {
		this.data[0] = x;
		this.data[1] = y;
		this.data[2] = z;

		return this;
	};

	Vector3.prototype.setd = addWarning(
		Vector3.prototype.setDirect, '.setd is deprecated; please use .setDirect instead');

	/**
	 * Sets Vector3 values with an Array of numbers as input. The current Vector3 is modified.
	 * @param {number[]} array
	 * @returns {Vector3} this for chaining
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * v1.setArray([2, 4, 6]); // v1 == (2, 4, 6)
	 */
	Vector3.prototype.setArray = function (array) {
		this.data[0] = array[0];
		this.data[1] = array[1];
		this.data[2] = array[2];

		return this;
	};

	Vector3.prototype.seta = addWarning(
		Vector3.prototype.setArray, '.seta is deprecated; please use .setArray instead');

	/**
	 * Sets Vector3 values with another {@link Vector3} as input.  The current Vector3 is modified.
	 * @param {Vector3} vector
	 * @returns {Vector3} this for chaining
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * var v2 = new Vector3(1, 2, 3);
	 * v1.setVector(v2); // v1 == (1, 2, 3)
	 */
	Vector3.prototype.setVector = function (vector) {
		this.data[0] = vector.data[0];
		this.data[1] = vector.data[1];
		this.data[2] = vector.data[2];

		return this;
	};

	Vector3.prototype.setv = addWarning(
		Vector3.prototype.setVector, '.setv is deprecated; please use .setVector instead');

	/**
	 * Adds numbers 'x', 'y', 'z' to the current Vector3 values
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} this for chaining
	 * @example
	 * var v1 = new Vector3(1, 2, 3);
	 * v1.addDirect(2, 4, 6); // v1 == (3, 6, 9)
	 */
	Vector3.prototype.addDirect = function (x, y, z) {
		this.data[0] += x;
		this.data[1] += y;
		this.data[2] += z;

		return this;
	};

	Vector3.prototype.add_d = addWarning(
		Vector3.prototype.addDirect, '.add_d is deprecated; please use .addDirect instead');

	/**
	 * Adds another {@link Vector3} to the current Vector3
	 * @param {Vector3} vector
	 * @returns {Vector3} this for chaining
	 * @example
	 * var v1 = new Vector3(1, 2, 3);
	 * var v2 = new Vector3(4, 5, 6);
	 * v1.addVector(v2); // v1 == (5, 7, 9)
	 */
	Vector3.prototype.addVector = function (vector) {
		this.data[0] += vector.data[0];
		this.data[1] += vector.data[1];
		this.data[2] += vector.data[2];

		return this;
	};

	Vector3.prototype.addv = addWarning(
		Vector3.prototype.addVector, '.addv is deprecated; please use .addVector instead');

	/**
	 * Multiplies the current Vector3 by numbers 'x', 'y', 'z' as inputs
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} this for chaining
	 * @example
	 * var v1 = new Vector3(1, 2, 3);
	 * v1.mulDirect(2, 4, 6); // v1 == (2, 8, 18)
	 */
	Vector3.prototype.mulDirect = function (x, y, z) {
		this.data[0] *= x;
		this.data[1] *= y;
		this.data[2] *= z;

		return this;
	};

	Vector3.prototype.muld = addWarning(
		Vector3.prototype.mulDirect, '.muld is deprecated; please use .mulDirect instead');

	/**
	 * Multiplies the current Vector3 by another {@link Vector3}
	 * @param {Vector3} vec3
	 * @returns {Vector3} this for chaining
	 * @example
	 * var v1 = new Vector3(1, 2, 3);
	 * var v2 = new Vector3(2, 2, 2);
	 * v1.mulVector(v2); // v1 == (2, 4, 6)
	 */
	Vector3.prototype.mulVector = function (vec3) {
		this.data[0] *= vec3.data[0];
		this.data[1] *= vec3.data[1];
		this.data[2] *= vec3.data[2];

		return this;
	};

	Vector3.prototype.mulv = addWarning(
		Vector3.prototype.mulVector, '.mulv is deprecated; please use .mulVector instead');

	/**
	 * Subtracts numbers 'x', 'y', 'z' from the current Vector3
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} this for chaining
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * v1.subDirect(1, 2, 3); // v1 == (-1, -2, -3)
	 */
	Vector3.prototype.subDirect = function (x, y, z) {
		this.data[0] -= x;
		this.data[1] -= y;
		this.data[2] -= z;

		return this;
	};

	Vector3.prototype.sub_d = addWarning(
		Vector3.prototype.subDirect, '.sub_d is deprecated; please use .subDirect instead');

	/**
	 * Subtracts another {@link Vector3} from the current Vector3
	 * @param {Vector3} vector
	 * @returns {Vector3} this for chaining
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * var v2 = new Vector3(2, 4, 6);
	 * v1.subVector(v2); // v1 == (-2, -4, -6)
	 */
	Vector3.prototype.subVector = function (vector) {
		this.data[0] -= vector.data[0];
		this.data[1] -= vector.data[1];
		this.data[2] -= vector.data[2];

		return this;
	};

	Vector3.prototype.subv = addWarning(
		Vector3.prototype.subVector, '.subv is deprecated; please use .subVector instead');


	/**
	 * Scales the vector by a factor
	 * @param {number} factor
	 * @returns {Vector3} Self for chaining
	 */
	Vector3.prototype.scale = function (factor) {
		this.data[0] *= factor;
		this.data[1] *= factor;
		this.data[2] *= factor;
		return this;
	};

	/**
	 * Calculates the length(magnitude) squared of the current Vector3.
	 *              Note: When comparing the relative distances between two points it is usually sufficient
	 *              to compare the squared distances, thus avoiding an expensive square root operation.
	 * @returns {number} length squared
	 * @example
	 * var v1 = new Vector3(0, 9, 0);
	 * var n1 = v1.lengthSquared(); // n1 == 81
	 */
	Vector3.prototype.lengthSquared = function () {
		return this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2];
	};

	/**
	 * Calculates length squared of vector
	 * @returns {number} length squared
	 */
	Vector3.prototype.length = function () {
		return Math.sqrt(this.lengthSquared());
	};

	Vector3.prototype.normalize = function () {
		var l = this.length();

		if (l < 0.0000001) {
			this.data[0] = 0;
			this.data[1] = 0;
			this.data[2] = 0;
		} else {
			l = 1.0 / l;
			this.data[0] *= l;
			this.data[1] *= l;
			this.data[2] *= l;
		}

		return this;
	};

	/**
	 * Computes the distance squared between two Vector3.
	 *              Note: When comparing the relative distances between two points it is usually sufficient
	 *              to compare the squared distances, thus avoiding an expensive square root operation.
	 * @param {Vector3} lhs Vector3.
	 * @param {Vector3} rhs Vector3.
	 * @returns {number} distance squared.
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * var v2 = new Vector3(0, 9, 0);
	 * var n1 = Vector3.distanceSquared(v1, v2); // n1 == 81
	 */
	Vector3.distanceSquared = function (lhs, rhs) {
		var x = lhs.data[0] - rhs.data[0],
			y = lhs.data[1] - rhs.data[1],
			z = lhs.data[2] - rhs.data[2];
		return x * x + y * y + z * z;
	};

	/**
	 * Computes the distance between two Vector3.
	 *              Note: When comparing the relative distances between two points it is usually sufficient
	 *              to compare the squared distances, thus avoiding an expensive square root operation.
	 * @param {Vector3} lhs Vector3.
	 * @param {Vector3} rhs Vector3.
	 * @returns {number} distance.
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * var v2 = new Vector3(0, 9, 0);
	 * var n1 = Vector3.distance(v1, v2); // n1 == 9
	 */
	Vector3.distance = function (lhs, rhs) {
		return Math.sqrt(Vector3.distanceSquared(lhs, rhs));
	};

	/**
	 * Computes the distance squared between the current Vector3 and another Vector3.
	 *              Note: When comparing the relative distances between two points it is usually sufficient
	 *              to compare the squared distances, thus avoiding an expensive square root operation.
	 * @param {Vector3} v Vector3.
	 * @returns {number} distance squared.
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * var v2 = new Vector3(0, 9, 0);
	 * var n1 = v1.distanceSquared(v2); // 81
	 */
	Vector3.prototype.distanceSquared = function (v) {
		return Vector3.distanceSquared(this, v);
	};

	/**
	 * Computes the distance between the current Vector3 and another Vector3.
	 *              Note: When comparing the relative distances between two points it is usually sufficient
	 *              to compare the squared distances, thus avoiding an expensive square root operation.
	 * @param {Vector3} v Vector3.
	 * @returns {number} distance.
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * var v2 = new Vector3(0, 9, 0);
	 * var n1 = v1.distance(v2); // n1 == 9
	 */
	Vector3.prototype.distance = function (v) {
		return Vector3.distance(this, v);
	};

	/**
	 * Clones the vector.
	 * @returns {Vector3} Clone of self.
	 */
	Vector3.prototype.clone = function () {
		return new Vector3(this);
	};

	/**
	 * Copies the values of another vector to this vector; an alias for .setVector
	 * @param {Vector3} Source vector
	 */
	Vector3.prototype.copy = Vector3.prototype.setVector;

	return Vector3;
});
