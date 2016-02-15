define([
	'goo/math/Vector2',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/math/Matrix4',
	'goo/math/Plane',
	'goo/math/MathUtils',
	'goo/math/Ray',
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere',
	'goo/renderer/bounds/BoundingVolume'
], function (
	Vector2,
	Vector3,
	Vector4,
	Matrix4,
	Plane,
	MathUtils,
	Ray,
	BoundingBox,
	BoundingSphere,
	BoundingVolume
) {
	'use strict';

	/**
	 * This class represents a view into a 3D scene and how that view should map to a 2D rendering surface.
	 * @param {number} [fov=45] The full vertical angle of view, in degrees.
	 * @param {number} [aspect=1] Aspect ratio of the 3D canvas used.
	 * @param {number} [near=1] Near plane clip distance.
	 * @param {number} [far=1000] Far plane clip distance.
	 */

	function Camera(fov, aspect, near, far) {
		fov = typeof fov !== 'undefined' ? fov : 45;
		aspect = typeof aspect !== 'undefined' ? aspect : 1;
		near = typeof near !== 'undefined' ? near : 1;
		far = typeof far !== 'undefined' ? far : 1000;

		// These need an onFrameChange() after being modified
		this.translation = new Vector3(0, 0, 0);
		this._left = new Vector3(-1, 0, 0);
		this._up = new Vector3(0, 1, 0);
		this._direction = new Vector3(0, 0, -1);

		// These need an onFrustumChange() after being modified
		this.size = 0.5; // hack
		this._frustumNear = this.near = 1.0;
		this._frustumFar = this.far = 2.0;
		this._frustumLeft = this.left = -0.5;
		this._frustumRight = this.right = 0.5;
		this._frustumTop = this.top = 0.5;
		this._frustumBottom = this.bottom = -0.5;

		// Used to speed up world-plane normal calculation in onFrameChange. Only calculated when frustum values are changed
		this._coeffLeft = new Vector2();
		this._coeffRight = new Vector2();
		this._coeffBottom = new Vector2();
		this._coeffTop = new Vector2();

		// These need an onViewPortChange() after being modified
		this._viewPortLeft = 0.0;
		this._viewPortRight = 1.0;
		this._viewPortTop = 1.0;
		this._viewPortBottom = 0.0;

		this._worldPlane = [];
		for (var i = 0; i < Camera.FRUSTUM_PLANES; i++) {
			this._worldPlane[i] = new Plane();
		}

		this.projectionMode = Camera.Perspective;
		this.lockedRatio = false;
		this.aspect = aspect;

		this._updateMVMatrix = true;
		this._updateInverseMVMatrix = true;
		this._updatePMatrix = true;
		this._updateMVPMatrix = true;
		this._updateInverseMVPMatrix = true;

		// NB: These matrices are column-major.
		this.modelView = new Matrix4();
		this.modelViewInverse = new Matrix4();
		this.projection = new Matrix4();
		this.modelViewProjection = new Matrix4();
		this.modelViewProjectionInverse = new Matrix4();

		//! AT: unused?
		this._planeState = 0;
		this._clipPlane = new Vector4();
		this._qCalc = new Vector4();

		this._corners = [];
		for (var i = 0; i < 8; i++) {
			this._corners.push(new Vector3());
		}
		this._extents = new Vector3();

		// Temp decl
		this.vNearPlaneCenter = new Vector3();
		this.vFarPlaneCenter = new Vector3();

		this.calcLeft = new Vector3();
		this.calcUp = new Vector3();

		this.changedProperties = true;

		this.setFrustumPerspective(fov, aspect, near, far);
		this.onFrameChange();

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	var newDirection = new Vector3(); // tmp

	// Planes of the frustum
	Camera.LEFT_PLANE = 0;
	Camera.RIGHT_PLANE = 1;
	Camera.BOTTOM_PLANE = 2;
	Camera.TOP_PLANE = 3;
	Camera.FAR_PLANE = 4;
	Camera.NEAR_PLANE = 5;
	Camera.FRUSTUM_PLANES = 6;

	//! schteppe: Why not capital letters for the following?

	/**
	 * Projection mode for perspective frustum
	 */
	Camera.Perspective = 0;
	/**
	 * Projection mode for parallel/ortographic frustum
	 */
	Camera.Parallel = 1;
	Camera.Custom = 2;

	/**
	 * Intersection response from camera.intersect
	 */
	Camera.Outside = 0;
	/**
	 * Intersection response from camera.intersect
	 */
	Camera.Inside = 1;
	/**
	 * Intersection response from camera.intersect
	 */
	Camera.Intersects = 2;

	/**
	 * Ensure our up, left and direction are unit-length vectors.
	 */
	Camera.prototype.normalize = function () {
		this._left.normalize();
		this._up.normalize();
		this._direction.normalize();
		this.onFrameChange();
	};

	/**
	 * Sets the projection mode of the camera. (Camera.Perspective / Camera.Parallel)
	 *
	 * @param {ProjectionMode} projectionMode The new projection mode - Camera.Perspective or Camera.Parallel
	 */
	Camera.prototype.setProjectionMode = function (projectionMode) {
		this.projectionMode = projectionMode;
		this.update();
	};

	/**
	 * Sets the frustum plane values of this camera using the given perspective values.
	 *
	 * @param {number} fov The full angle of view on the Y axis, in degrees.
	 * @param {number} aspect The aspect ratio of our view (generally in [0, 1]). Often this is canvas width / canvas height.
	 * @param {number} near Near plane value
	 * @param {number} far Far plane value
	 */
	Camera.prototype.setFrustumPerspective = function (fov, aspect, near, far) {
		if (fov !== undefined && fov !== null) {
			this.fov = fov;
		}
		if (aspect !== undefined && aspect !== null) {
			this.aspect = aspect;
		}
		if (near !== undefined && near !== null) {
			this.near = near;
		}
		if (far !== undefined && far !== null) {
			this.far = far;
		}

		if (this.fov !== undefined) {
			var h = Math.tan(this.fov * MathUtils.DEG_TO_RAD * 0.5) * this.near;
			var w = h * this.aspect;
			this._frustumLeft = -w;
			this._frustumRight = w;
			this._frustumBottom = -h;
			this._frustumTop = h;
			this._frustumNear = this.near;
			this._frustumFar = this.far;

			// handle invalid frustum-far
			if (this._frustumFar - this._frustumNear < MathUtils.EPSILON) {
				this._frustumFar = this._frustumNear + MathUtils.EPSILON;
			}

			this.onFrustumChange();
		}
	};

	/**
	 * Sets the frustum plane values of this camera using the given values.
	 *
	 * @param {number} near
	 * @param {number} far
	 * @param {number} left
	 * @param {number} right
	 * @param {number} top
	 * @param {number} bottom
	 */
	Camera.prototype.setFrustum = function (near, far, left, right, top, bottom, aspect) {
		if (near !== undefined && near !== null) {
			this.near = near;
		}
		if (far !== undefined && far !== null) {
			this.far = far;
		}

		if (left !== undefined && left !== null) {
			this.left = left;
		}
		if (right !== undefined && right !== null) {
			this.right = right;
		}
		if (top !== undefined && top !== null) {
			this.top = top;
		}
		if (bottom !== undefined && bottom !== null) {
			this.bottom = bottom;
		}
		if (aspect !== undefined && aspect !== null) {
			this.aspect = aspect;
		}

		this._frustumNear = this.near;
		this._frustumFar = this.far;
		this._frustumLeft = this.left * this.aspect;
		this._frustumRight = this.right * this.aspect;
		this._frustumTop = this.top;
		this._frustumBottom = this.bottom;

		// handle invalid frustum-far
		if (this._frustumFar - this._frustumNear < MathUtils.EPSILON) {
			this._frustumFar = this._frustumNear + MathUtils.EPSILON;
		}

		this.onFrustumChange();
	};

	/**
	 * Copy the settings of a source camera to this camera.
	 *
	 * @param {Camera} source
	 */
	Camera.prototype.copy = function (source) {
		this.translation.set(source.translation);
		this._left.set(source._left);
		this._up.set(source._up);
		this._direction.set(source._direction);

		this.fov = source.fov;
		this.aspect = source.aspect;

		this.near = source.near;
		this.far = source.far;
		this.left = source.left;
		this.right = source.right;
		this.top = source.top;
		this.bottom = source.bottom;

		this._frustumLeft = source._frustumLeft;
		this._frustumRight = source._frustumRight;
		this._frustumBottom = source._frustumBottom;
		this._frustumTop = source._frustumTop;
		this._frustumNear = source._frustumNear;
		this._frustumFar = source._frustumFar;

		this.projectionMode = source.projectionMode;

		this.onFrustumChange();
		this.onFrameChange();

		return this;
	};

	/**
	 * Sets the location and the left, up and direction axes of the camera.
	 *
	 * @param {Vector3} location
	 * @param {Vector3} left
	 * @param {Vector3} up
	 * @param {Vector3} direction
	 */
	Camera.prototype.setFrame = function (location, left, up, direction) {
		this._left.set(left);
		this._up.set(up);
		this._direction.set(direction);
		this.translation.set(location);

		this.onFrameChange();
	};

	/**
	 * A convenience method for auto-setting the frame based on a world position the user desires the camera to look at. It points the camera towards
	 * the given position using the difference between that position and the current camera location as a direction vector and the general
	 * worldUpVector to compute up and left camera vectors.
	 *
	 * @param {Vector3} pos Where to look at in terms of world coordinates.
	 * @param {Vector3} worldUpVector A vector indicating the up direction of the world. (often Vector3.UNIT_Y or Vector3.UNIT_Z).
	 */
	Camera.prototype.lookAt = function (pos, worldUpVector) {
		newDirection.set(pos).sub(this.translation).normalize();

		// check to see if we haven't really updated camera -- no need to call
		// sets.
		if (newDirection.equals(this._direction)) {
			return;
		}
		this._direction.set(newDirection);

		this._up.set(worldUpVector).normalize();
		if (this._up.equals(Vector3.ZERO)) {
			this._up.set(Vector3.UNIT_Y);
		}
		this._left.set(this._up).cross(this._direction).normalize();
		if (this._left.equals(Vector3.ZERO)) {
			if (this._direction.x !== 0.0) {
				this._left.setDirect(this._direction.y, -this._direction.x, 0);
			} else {
				this._left.setDirect(0, this._direction.z, -this._direction.y);
			}
		}
		this._up.set(this._direction).cross(this._left).normalize();

		this.onFrameChange();
	};

	/**
	 * Forces all aspect of the camera to be updated from internal values, and sets all dirty flags to true so that the next apply() call will fully
	 * set this camera to the render context.
	 */
	Camera.prototype.update = function () {
		this.onFrustumChange();
		this.onFrameChange();
	};

	/**
	 * Checks a bounding volume against the planes of this camera's frustum and returns if it is completely inside of, outside of, or intersecting.
	 * Example returns are Camera.Inside, Camera.Outside or Camera.Intersects.
	 *
	 * @param {BoundingVolume} bound The BoundingVolume to check for culling.
	 * @returns {number} Intersection type.
	 */
	Camera.prototype.contains = function (bound) {
		if (!bound) {
			return Camera.Inside;
		}

		var rVal = Camera.Inside;

		for (var planeCounter = Camera.FRUSTUM_PLANES - 1; planeCounter >= 0; planeCounter--) {
			switch (bound.whichSide(this._worldPlane[planeCounter])) {
				case BoundingVolume.Inside:
					return Camera.Outside;
				case BoundingVolume.Outside:
					break;
				case BoundingVolume.Intersects:
					rVal = Camera.Intersects;
					break;
			}
		}

		return rVal;
	};

	/**
	 * Updates internal frustum coefficient values to reflect the current frustum plane values.
	 * This is an optimization to move normalization/rotation of plane normals out to be done
	 * only when the frustum values change.
	 */
	Camera.prototype.onFrustumChange = function () {
		if (this.projectionMode === Camera.Perspective) {
			this._coeffLeft.setDirect(-this._frustumNear, -this._frustumLeft).normalize();
			this._coeffRight.setDirect(this._frustumNear, this._frustumRight).normalize();
			this._coeffBottom.setDirect(this._frustumNear, -this._frustumBottom).normalize();
			this._coeffTop.setDirect(-this._frustumNear, this._frustumTop).normalize();
		} else if (this.projectionMode === Camera.Parallel) {
			if (this._frustumRight > this._frustumLeft) {
				this._coeffLeft.setDirect(-1, 0);
				this._coeffRight.setDirect(1, 0);
			} else {
				this._coeffLeft.setDirect(1, 0);
				this._coeffRight.setDirect(-1, 0);
			}

			if (this._frustumTop > this._frustumBottom) {
				this._coeffBottom.setDirect(-1, 0);
				this._coeffTop.setDirect(1, 0);
			} else {
				this._coeffBottom.setDirect(1, 0);
				this._coeffTop.setDirect(-1, 0);
			}
		}

		this._updatePMatrix = true;
		this._updateMVPMatrix = true;
		this._updateInverseMVMatrix = true;
		this._updateInverseMVPMatrix = true;

		this.changedProperties = true;
	};

	/**
	 * Updates the values of the world planes associated with this camera.
	 */
	Camera.prototype.onFrameChange = function () {
		var plane;

		// left plane
		plane = this._worldPlane[Camera.LEFT_PLANE];

		plane.normal.x = this._left.x * this._coeffLeft.x + this._direction.x * this._coeffLeft.y;
		plane.normal.y = this._left.y * this._coeffLeft.x + this._direction.y * this._coeffLeft.y;
		plane.normal.z = this._left.z * this._coeffLeft.x + this._direction.z * this._coeffLeft.y;
		plane.constant = this.translation.dot(plane.normal);

		// right plane
		plane = this._worldPlane[Camera.RIGHT_PLANE];
		plane.normal.x = this._left.x * this._coeffRight.x + this._direction.x * this._coeffRight.y;
		plane.normal.y = this._left.y * this._coeffRight.x + this._direction.y * this._coeffRight.y;
		plane.normal.z = this._left.z * this._coeffRight.x + this._direction.z * this._coeffRight.y;
		plane.constant = this.translation.dot(plane.normal);

		// bottom plane
		plane = this._worldPlane[Camera.BOTTOM_PLANE];
		plane.normal.x = this._up.x * this._coeffBottom.x + this._direction.x * this._coeffBottom.y;
		plane.normal.y = this._up.y * this._coeffBottom.x + this._direction.y * this._coeffBottom.y;
		plane.normal.z = this._up.z * this._coeffBottom.x + this._direction.z * this._coeffBottom.y;
		plane.constant = this.translation.dot(plane.normal);

		// top plane
		plane = this._worldPlane[Camera.TOP_PLANE];
		plane.normal.x = this._up.x * this._coeffTop.x + this._direction.x * this._coeffTop.y;
		plane.normal.y = this._up.y * this._coeffTop.x + this._direction.y * this._coeffTop.y;
		plane.normal.z = this._up.z * this._coeffTop.x + this._direction.z * this._coeffTop.y;
		plane.constant = this.translation.dot(plane.normal);

		if (this.projectionMode === Camera.Parallel) {
			if (this._frustumRight > this._frustumLeft) {
				this._worldPlane[Camera.LEFT_PLANE].constant += this._frustumLeft;
				this._worldPlane[Camera.RIGHT_PLANE].constant -= this._frustumRight;
			} else {
				this._worldPlane[Camera.LEFT_PLANE].constant -= this._frustumLeft;
				this._worldPlane[Camera.RIGHT_PLANE].constant += this._frustumRight;
			}

			if (this._frustumBottom > this._frustumTop) {
				this._worldPlane[Camera.TOP_PLANE].constant += this._frustumTop;
				this._worldPlane[Camera.BOTTOM_PLANE].constant -= this._frustumBottom;
			} else {
				this._worldPlane[Camera.TOP_PLANE].constant -= this._frustumTop;
				this._worldPlane[Camera.BOTTOM_PLANE].constant += this._frustumBottom;
			}
		}

		var dirDotLocation = this._direction.dot(this.translation);

		// far plane
		plane = this._worldPlane[Camera.FAR_PLANE];
		plane.normal.x = -this._direction.x;
		plane.normal.y = -this._direction.y;
		plane.normal.z = -this._direction.z;
		plane.constant = -(dirDotLocation + this._frustumFar);

		// near plane
		plane = this._worldPlane[Camera.NEAR_PLANE];
		plane.normal.x = this._direction.x;
		plane.normal.y = this._direction.y;
		plane.normal.z = this._direction.z;
		plane.constant = dirDotLocation + this._frustumNear;

		this._updateMVMatrix = true;
		this._updateMVPMatrix = true;
		this._updateInverseMVMatrix = true;
		this._updateInverseMVPMatrix = true;
	};

	/**
	 * Updates the value of our projection matrix.
	 */
	Camera.prototype.updateProjectionMatrix = function () {
		if (this.projectionMode === Camera.Parallel) {
			this.projection.setIdentity();

			var d = this.projection.data;
			d[0] = 2.0 / (this._frustumRight - this._frustumLeft);
			d[5] = 2.0 / (this._frustumTop - this._frustumBottom);
			d[10] = -2.0 / (this._frustumFar - this._frustumNear);
			d[12] = -(this._frustumRight + this._frustumLeft) / (this._frustumRight - this._frustumLeft);
			d[13] = -(this._frustumTop + this._frustumBottom) / (this._frustumTop - this._frustumBottom);
			d[14] = -(this._frustumFar + this._frustumNear) / (this._frustumFar - this._frustumNear);
		} else if (this.projectionMode === Camera.Perspective) {
			this.projection.setIdentity();

			var d = this.projection.data;
			d[0] = 2.0 * this._frustumNear / (this._frustumRight - this._frustumLeft);
			d[5] = 2.0 * this._frustumNear / (this._frustumTop - this._frustumBottom);
			d[8] = (this._frustumRight + this._frustumLeft) / (this._frustumRight - this._frustumLeft);
			d[9] = (this._frustumTop + this._frustumBottom) / (this._frustumTop - this._frustumBottom);
			d[10] = -(this._frustumFar + this._frustumNear) / (this._frustumFar - this._frustumNear);
			d[11] = -1.0;
			d[14] = -(2.0 * this._frustumFar * this._frustumNear) / (this._frustumFar - this._frustumNear);
			d[15] = -0.0;
		}
	};

	/**
	 * Updates the value of our model view matrix.
	 */
	Camera.prototype.updateModelViewMatrix = function () {
		this.modelView.setIdentity();

		var d = this.modelView.data;

		d[0] = -this._left.x;
		d[4] = -this._left.y;
		d[8] = -this._left.z;

		d[1] = this._up.x;
		d[5] = this._up.y;
		d[9] = this._up.z;

		d[2] = -this._direction.x;
		d[6] = -this._direction.y;
		d[10] = -this._direction.z;

		d[12] = this._left.dot(this.translation);
		d[13] = -this._up.dot(this.translation);
		d[14] = this._direction.dot(this.translation);
	};

	/**
	 * Calculate a Pick Ray using the given screen position at the near plane of this camera and the camera's position in space.
	 *
	 * @param {number} screenX The screen x position.
	 * @param {number} screenY The screen y position.
	 * @param {number} screenWidth The screen width.
	 * @param {number} screenHeight The screen height.
	 * @param {Ray} [store] The Ray to store the result in. If null, a new Ray is created and returned.
	 * @returns {Ray} The resulting Ray.
	 */
	Camera.prototype.getPickRay = function (screenX, screenY, screenWidth, screenHeight, store) {
		if (!store) {
			store = new Ray();
		}
		this.getWorldCoordinates(screenX, screenY, screenWidth, screenHeight, 0, store.origin);
		this.getWorldCoordinates(screenX, screenY, screenWidth, screenHeight, 0.3, store.direction).sub(store.origin).normalize();
		return store;
	};

	/**
	 * Converts a local x, y screen position and depth value to world coordinates based on the current settings of this camera.
	 * This function calls getWorldCoordinates after converting zDepth to screen space.
	 *
	 * @param {number} screenX The screen x position.
	 * @param {number} screenY The screen y position.
	 * @param {number} screenWidth The screen width.
	 * @param {number} screenHeight The screen height.
	 * @param {number} zDepth The depth into the camera view in world distance.
	 * @param {Vector3} [store] Use to avoid object creation. if not null, the results are stored in the given vector and returned. Otherwise, a new vector is
	 *            created.
	 * @returns {Vector3} Vector containing the world coordinates.
	 */
	Camera.prototype.getWorldPosition = function (screenX, screenY, screenWidth, screenHeight, zDepth, store) {
		if (this.projectionMode === Camera.Parallel) {
			zDepth = ((zDepth - this.near) / (this.far - this.near));
		} else {
			// http://www.sjbaker.org/steve/omniv/love_your_z_buffer.html
			zDepth = MathUtils.clamp(zDepth, this.near, this.far);
			zDepth = (this.far / (this.far - this.near)) + ((this.far * this.near / (this.near - this.far)) / zDepth);
		}
		return this.getWorldCoordinates(screenX, screenY, screenWidth, screenHeight, zDepth, store);
	};

	/**
	 * Converts a local x, y screen position and depth value to world coordinates based on the current settings of this camera.
	 *
	 * @param {number} screenX The screen x position (x=0 is the leftmost coordinate of the screen).
	 * @param {number} screenY The screen y position (y=0 is the top of the screen).
	 * @param {number} screenWidth The screen width.
	 * @param {number} screenHeight The screen height.
	 * @param {number} zDepth The {@link http://www.sjbaker.org/steve/omniv/love_your_z_buffer.html non linear depth} between 0 and 1 into the camera view. 0 indicates the near plane of the camera and 1 indicates the far plane.
	 * @param {Vector3} [store] Use to avoid object creation. If not null, the results are stored in the given vector and returned. Otherwise, a new vector is
	 *            created.
	 * @returns {Vector3} Vector containing the world coordinates.
	 */
	Camera.prototype.getWorldCoordinates = function (screenX, screenY, screenWidth, screenHeight, zDepth, store) {
		if (!store) {
			store = new Vector3();
		}
		this.checkInverseModelViewProjection();
		var position = new Vector4();

		var x = (screenX / screenWidth - this._viewPortLeft) / (this._viewPortRight - this._viewPortLeft) * 2 - 1;
		var y = ((screenHeight - screenY) / screenHeight - this._viewPortBottom) / (this._viewPortTop - this._viewPortBottom) * 2 - 1;

		/*
		var aspect = this.aspect / (screenWidth / screenHeight);
		if (aspect > 1) {
			y *= aspect;
		} else if (aspect < 1) {
			x /= aspect;
		}
		*/

		position.setDirect(x, y, zDepth * 2 - 1, 1);
		position.applyPost(this.modelViewProjectionInverse);
		if (position.w !== 0.0) {
			position.scale(1.0 / position.w);
		}
		store.x = position.x;
		store.y = position.y;
		store.z = position.z;

		return store;
	};

	/**
	 * Converts a position in world coordinate space to an x, y screen position and non linear depth value using the current settings of this camera.
	 *
	 * @param {Vector3} worldPos The position in world space to retrieve screen coordinates for.
	 * @param {number} screenWidth The screen width.
	 * @param {number} screenHeight The screen height.
	 * @param {Vector3} [store] Use to avoid object creation. if not null, the results are stored in the given vector and returned. Otherwise, a new vector is
	 *            created.
	 * @returns {Vector3} Vector containing the screen coordinates as x and y and the distance as a non linear value between the near (0) and far (1) planes.
	 */
	Camera.prototype.getScreenCoordinates = function (worldPosition, screenWidth, screenHeight, store) {
		store = this.getNormalizedDeviceCoordinates(worldPosition, store);

		/*
		var aspect = this.aspect / (screenWidth / screenHeight);
		if (aspect > 1) {
			store.y /= aspect;
		} else if (aspect < 1) {
			store.x *= aspect;
		}
		*/

		store.x = (store.x + 1) * (this._viewPortRight - this._viewPortLeft) / 2 * screenWidth;
		store.y = (1 - store.y) * (this._viewPortTop - this._viewPortBottom) / 2 * screenHeight;
		store.z = (store.z + 1) / 2;

		return store;
	};

	/**
	 * Converts a position in world coordinate space to a x, y, z frustum position using the current settings of this camera.
	 *
	 * @param {Vector3} worldPos the position in space to retrieve frustum coordinates for.
	 * @param {Vector3} [store] Use to avoid object creation. if not null, the results are stored in the given vector and returned.
	 *        Otherwise, a new vector is created.
	 * @returns {Vector3} Vector containing the x, y and z frustum position.
	 */
	Camera.prototype.getFrustumCoordinates = function (worldPosition, store) {
		store = this.getNormalizedDeviceCoordinates(worldPosition, store);

		store.x = (store.x + 1) * (this._frustumRight - this._frustumLeft) / 2 + this._frustumLeft;
		store.y = (store.y + 1) * (this._frustumTop - this._frustumBottom) / 2 + this._frustumBottom;
		store.z = (store.z + 1) * (this._frustumFar - this._frustumNear) / 2 + this._frustumNear;

		return store;
	};

	/**
	 * Converts a position in world coordinate space to normalized device coordinates by applying the modelViewProjection from this camera.
	 *
	 * @param {Vector3} worldPos The position in space to retrieve coordinates for.
	 * @param {Vector3} [store] Use to avoid object creation. If not null, the results are stored in the given vector and returned.
	 *        Otherwise, a new vector is created.
	 * @returns {Vector3} Vector containing the x, y and z normalized device coordinates.
	 */
	Camera.prototype.getNormalizedDeviceCoordinates = function (worldPosition, store) {
		if (!store) {
			store = new Vector3();
		}
		this.checkModelViewProjection();
		var position = new Vector4();
		position.setDirect(worldPosition.x, worldPosition.y, worldPosition.z, 1);
		position.applyPost(this.modelViewProjection);
		if (position.w !== 0.0) {
			position.scale(1.0 / position.w);
		}
		store.x = position.x;
		store.y = position.y;
		store.z = position.z;

		return store;
	};

	/**
	 * Update the modelView matrix if necessary.
	 */
	Camera.prototype.checkModelView = function () {
		if (this._updateMVMatrix) {
			this.updateModelViewMatrix();
			this._updateMVMatrix = false;
		}
	};

	/**
	 * Update the projection matrix if necessary.
	 */
	Camera.prototype.checkProjection = function () {
		if (this._updatePMatrix) {
			this.updateProjectionMatrix();
			this._updatePMatrix = false;
		}
	};

	/**
	 * Update the modelViewProjection matrix if necessary.
	 */
	Camera.prototype.checkModelViewProjection = function () {
		if (this._updateMVPMatrix) {
			this.checkModelView();
			this.checkProjection();
			// because these are transposed, we need to flip order
			this.modelViewProjection.mul2(this.getProjectionMatrix(), this.getViewMatrix());
			this._updateMVPMatrix = false;
		}
	};

	/**
	 * Update the inverse modelView matrix if necessary.
	 */
	Camera.prototype.checkInverseModelView = function () {
		if (this._updateInverseMVMatrix) {
			this.checkModelView();
			this.modelViewInverse.copy(this.modelView).invert();
			//Matrix4.invert(this.modelView, this.modelViewInverse);
			this._updateInverseMVMatrix = false;
		}
	};

	/**
	 * Update the inverse modelViewProjection matrix if necessary.
	 */
	Camera.prototype.checkInverseModelViewProjection = function () {
		if (this._updateInverseMVPMatrix) {
			this.checkModelViewProjection();
			this.modelViewProjectionInverse.copy(this.modelViewProjection).invert();
			//Matrix4.invert(this.modelViewProjection, this.modelViewProjectionInverse);
			this._updateInverseMVPMatrix = false;
		}
	};

	/**
	 * @returns {Matrix4} The modelView matrix.
	 */
	Camera.prototype.getViewMatrix = function () {
		this.checkModelView();
		return this.modelView;
	};

	/**
	 * @returns {Matrix4} The projection matrix.
	 */
	Camera.prototype.getProjectionMatrix = function () {
		this.checkProjection();
		return this.projection;
	};

	/**
	 * @returns {Matrix4} The modelViewProjection matrix.
	 */
	Camera.prototype.getViewProjectionMatrix = function () {
		this.checkModelViewProjection();
		return this.modelViewProjection;
	};

	/**
	 * @returns {Matrix4} The modelViewInverse matrix.
	 */
	Camera.prototype.getViewInverseMatrix = function () {
		this.checkInverseModelView();
		return this.modelViewInverse;
	};

	/**
	 * @returns {Matrix4} The modelViewProjectionInverse matrix.
	 */
	Camera.prototype.getViewProjectionInverseMatrix = function () {
		this.checkInverseModelViewProjection();
		return this.modelViewProjectionInverse;
	};

	/**
	 * Compress this camera's near and far frustum planes to be smaller if possible,
	 * using the given bounds as a measure.
	 * @param {BoundingVolume} sceneBounds The scene bounds.
	 */
	Camera.prototype.pack = function (sceneBounds) {
		var center = sceneBounds.center;
		var corners = this._corners;
		var extents = this._extents;

		for (var i = 0; i < corners.length; i++) {
			corners[i].set(center);
		}

		if (sceneBounds instanceof BoundingBox) {
			extents.setDirect(sceneBounds.xExtent, sceneBounds.yExtent, sceneBounds.zExtent);
		} else if (sceneBounds instanceof BoundingSphere) {
			extents.setDirect(sceneBounds.radius, sceneBounds.radius, sceneBounds.radius);
		}

		corners[0].addDirect(extents.x, extents.y, extents.z);
		corners[1].addDirect(extents.x, -extents.y, extents.z);
		corners[2].addDirect(extents.x, extents.y, -extents.z);
		corners[3].addDirect(extents.x, -extents.y, -extents.z);
		corners[4].addDirect(-extents.x, extents.y, extents.z);
		corners[5].addDirect(-extents.x, -extents.y, extents.z);
		corners[6].addDirect(-extents.x, extents.y, -extents.z);
		corners[7].addDirect(-extents.x, -extents.y, -extents.z);

		var mvMatrix = this.getViewMatrix();
		var optimalCameraNear = Number.MAX_VALUE;
		var optimalCameraFar = -Number.MAX_VALUE;
		var position = new Vector4();
		for (var i = 0; i < corners.length; i++) {
			position.setDirect(corners[i].x, corners[i].y, corners[i].z, 1);
			position.applyPre(mvMatrix);

			optimalCameraNear = Math.min(-position.z, optimalCameraNear);
			optimalCameraFar = Math.max(-position.z, optimalCameraFar);
		}

		optimalCameraNear = Math.min(Math.max(this._frustumNear, optimalCameraNear), this._frustumFar);
		optimalCameraFar = Math.max(optimalCameraNear, Math.min(this._frustumFar, optimalCameraFar));

		var change = optimalCameraNear / this._frustumNear;
		this._frustumLeft = this._frustumLeft * change;
		this._frustumRight = this._frustumRight * change;
		this._frustumTop = this._frustumTop * change;
		this._frustumBottom = this._frustumBottom * change;

		this._frustumNear = optimalCameraNear;
		this._frustumFar = optimalCameraFar;
	};

	Camera.prototype.calculateFrustumCorners = function (fNear, fFar) {
		fNear = fNear !== undefined ? fNear : this._frustumNear;
		fFar = fFar !== undefined ? fFar : this._frustumFar;

		var fNearPlaneHeight = (this._frustumTop - this._frustumBottom) * fNear * 0.5 / this._frustumNear;
		var fNearPlaneWidth = (this._frustumRight - this._frustumLeft) * fNear * 0.5 / this._frustumNear;

		var fFarPlaneHeight = (this._frustumTop - this._frustumBottom) * fFar * 0.5 / this._frustumNear;
		var fFarPlaneWidth = (this._frustumRight - this._frustumLeft) * fFar * 0.5 / this._frustumNear;

		if (this.projectionMode === Camera.Parallel) {
			fNearPlaneHeight = (this._frustumTop - this._frustumBottom) * 0.5;
			fNearPlaneWidth = (this._frustumRight - this._frustumLeft) * 0.5;

			fFarPlaneHeight = (this._frustumTop - this._frustumBottom) * 0.5;
			fFarPlaneWidth = (this._frustumRight - this._frustumLeft) * 0.5;
		}

		var vNearPlaneCenter = this.vNearPlaneCenter;
		var vFarPlaneCenter = this.vFarPlaneCenter;

		var direction = this.calcLeft;

		direction.set(this._direction).scale(fNear);
		vNearPlaneCenter.set(this.translation).add(direction);
		direction.set(this._direction).scale(fFar);
		vFarPlaneCenter.set(this.translation).add(direction);

		var left = this.calcLeft;
		var up = this.calcUp;

		left.set(this._left).scale(fNearPlaneWidth);
		up.set(this._up).scale(fNearPlaneHeight);
		this._corners[0].set(vNearPlaneCenter).sub(left).sub(up);
		this._corners[1].set(vNearPlaneCenter).add(left).sub(up);
		this._corners[2].set(vNearPlaneCenter).add(left).add(up);
		this._corners[3].set(vNearPlaneCenter).sub(left).add(up);

		left.set(this._left).scale(fFarPlaneWidth);
		up.set(this._up).scale(fFarPlaneHeight);
		this._corners[4].set(vFarPlaneCenter).sub(left).sub(up);
		this._corners[5].set(vFarPlaneCenter).add(left).sub(up);
		this._corners[6].set(vFarPlaneCenter).add(left).add(up);
		this._corners[7].set(vFarPlaneCenter).sub(left).add(up);

		return this._corners;
	};

	/**
	 * Clip using an oblique frustum different from the the view frustum
	 * @param {Vector4} clipPlane Clipping plane. (nx, ny, nz, constant)
	 */
	Camera.prototype.setToObliqueMatrix = function (clipPlane) {
		var transformedClipPlane = this._clipPlane.set(clipPlane);

		// bring the clip-plane into camera space which is needed for the calculation
		transformedClipPlane.w = 0;
		transformedClipPlane.applyPost(this.getViewMatrix());
		transformedClipPlane.w = this.translation.y * clipPlane.y - clipPlane.w;

		// calculate oblique camera projection matrix
		this._updatePMatrix = true;
		var projection = this.getProjectionMatrix();

		this._qCalc.setDirect(
			(MathUtils.sign(transformedClipPlane.x) + projection[8]) / projection[0],
			(MathUtils.sign(transformedClipPlane.y) + projection[9]) / projection[5],
			-1,
			(1.0 + projection[10]) / projection[14]
		);

		transformedClipPlane.scale(2.0 / transformedClipPlane.dot(this._qCalc));

		projection[2] = transformedClipPlane.x;
		projection[6] = transformedClipPlane.y;
		projection[10] = transformedClipPlane.z + 1.0;
		projection[14] = transformedClipPlane.w;

		this._updateMVPMatrix = true;
		this._updateInverseMVPMatrix = true;
	};

	Camera.prototype.clone = function () {
		var clone = new Camera(this.fov, this.aspect, this.near, this.far);
		clone.copy(this);
		return clone;
	};

	return Camera;
});
