define(['goo/util/Handy', 'goo/math/Vector3', 'goo/math/Vector4', 'goo/math/Matrix4x4', 'goo/renderer/Plane', 'goo/math/MathUtils'],
	/** @lends Camera */
	function (Handy,
	Vector3, Vector4, Matrix4x4, Plane, MathUtils) {
	"use strict";

	/**
	 * @class This class represents a view into a 3d scene and how that view should map to a 2D rendering surface.
	 * @param {Number} fov the full vertical angle of view, in degrees.
	 * @param {Number} aspect aspect ratio
	 * @param {Number} near near plane distance
	 * @param {Number} far far plane distance
	 */
	function Camera(fov, aspect, near, far) {
		// TODO: these needs onFrameChange() after change
		this.translation = new Vector3(0, 0, 0);
		this._left = new Vector3(-1, 0, 0);
		this._up = new Vector3(0, 1, 0);
		this._direction = new Vector3(0, 0, -1);

		Handy.defineProperty(this, 'this._depthRangeNear', 0.0, function () {
			this._depthRangeDirty = true;
		});
		Handy.defineProperty(this, 'this._depthRangeFar', 1.0, function () {
			this._depthRangeDirty = true;
		});
		this._depthRangeDirty = true;

		// TODO: needs onFurstumChange()
		this._frustumNear = 1.0;
		this._frustumFar = 2.0;
		this._frustumLeft = -0.5;
		this._frustumRight = 0.5;
		this._frustumTop = 0.5;
		this._frustumBottom = -0.5;

		// Handy.defineProperty(this, '_frustumNear', 1.0, function() {
		// onFrustumChange();
		// });
		// Handy.defineProperty(this, '_frustumFar', 2.0, function() {
		// onFrustumChange();
		// });
		// Handy.defineProperty(this, '_frustumLeft', -0.5, function() {
		// onFrustumChange();
		// });
		// Handy.defineProperty(this, '_frustumRight', 0.5, function() {
		// onFrustumChange();
		// });
		// Handy.defineProperty(this, '_frustumTop', 0.5, function() {
		// onFrustumChange();
		// });
		// Handy.defineProperty(this, '_frustumBottom', -0.5, function() {
		// onFrustumChange();
		// });

		this._coeffLeft = [];
		this._coeffRight = [];
		this._coeffBottom = [];
		this._coeffTop = [];

		// TODO: need onViewPortChange()
		this._viewPortLeft = 0.0;
		this._viewPortRight = 1.0;
		this._viewPortTop = 1.0;
		this._viewPortBottom = 0.0;

		this._planeQuantity = 6;

		this._worldPlane = [];
		for (var i = 0; i < Camera.FRUSTUM_PLANES; i++) {
			this._worldPlane[i] = new Plane();
		}

		this._newDirection = new Vector3();

		this.projectionMode = Camera.Perspective;

		this._updateMVMatrix = true;
		this._updateInverseMVMatrix = true;
		this._updatePMatrix = true;
		this._updateMVPMatrix = true;
		this._updateInverseMVPMatrix = true;

		// NB: These matrices are column-major.
		this.modelView = new Matrix4x4();
		this.modelViewInverse = new Matrix4x4();
		this.projection = new Matrix4x4();
		this.modelViewProjection = new Matrix4x4();
		this.modelViewProjectionInverse = new Matrix4x4();

		this._depthRangeDirty = true;
		this._viewPortDirty = true;

		this._planeState = 0;

		this.setFrustumPerspective(fov, aspect, near, far);
		// this.onFrustumChange();
		// this.onViewPortChange();
		this.onFrameChange();
	}

	/**
	 * Planes of the frustum
	 */
	Camera.LEFT_PLANE = 0;
	Camera.RIGHT_PLANE = 1;
	Camera.BOTTOM_PLANE = 2;
	Camera.TOP_PLANE = 3;
	Camera.FAR_PLANE = 4;
	Camera.NEAR_PLANE = 5;
	Camera.FRUSTUM_PLANES = 6;

	/**
	 * Intersection type
	 */
	Camera.Perspective = 0;
	Camera.Parallel = 1;
	Camera.Custom = 2;

	/**
	 * Projection mode used by the camera.
	 */
	Camera.Outside = 0;
	Camera.Inside = 1;
	Camera.Intersects = 2;

	/**
	 * Ensure our up, left and direction are unit-length vectors.
	 */
	Camera.prototype.normalize = function () {
		this._left.normalize();
		this._up.normalize();
		this._direction.normalize();
		onFrameChange();
	};

	/**
	 * Sets the frustum plane values of this camera using the given perspective values.
	 *
	 * @param fovY the full angle of view on the Y axis, in degrees.
	 * @param aspect the aspect ratio of our view (generally in [0,1]). Often this is canvas width / canvas height.
	 * @param near our near plane value
	 * @param far our far plane value
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

		var h = Math.tan(this.fov * MathUtils.DEG_TO_RAD * 0.5) * this.near;
		var w = h * this.aspect;
		this._frustumLeft = -w;
		this._frustumRight = w;
		this._frustumBottom = -h;
		this._frustumTop = h;
		this._frustumNear = this.near;
		this._frustumFar = this.far;

		this.onFrustumChange();
	};

	/**
	 * Sets the frustum plane values of this camera using the given values.
	 *
	 * @param near
	 * @param far
	 * @param left
	 * @param right
	 * @param top
	 * @param bottom
	 */
	Camera.prototype.setFrustum = function (near, far, left, right, top, bottom) {
		this._frustumNear = near;
		this._frustumFar = far;
		this._frustumLeft = left;
		this._frustumRight = right;
		this._frustumTop = top;
		this._frustumBottom = bottom;

		this.onFrustumChange();
	};

	/**
	 * Sets the axes and location of the camera. Similar to {@link #setAxes(ReadOnlyVector3, ReadOnlyVector3, ReadOnlyVector3)}, but sets camera
	 * location as well.
	 *
	 * @param location
	 * @param left
	 * @param up
	 * @param direction
	 */
	Camera.prototype.setFrame = function (location, left, up, direction) {
		this._left.copy(left);
		this._up.copy(up);
		this._direction.copy(direction);
		this.translation.copy(location);

		this.onFrameChange();
	};

	/**
	 * A convenience method for auto-setting the frame based on a world position the user desires the camera to look at. It points the camera towards
	 * the given position using the difference between that position and the current camera location as a direction vector and the general
	 * worldUpVector to compute up and left camera vectors.
	 *
	 * @param {Vector3} pos Where to look at in terms of world coordinates.
	 * @param {Vector3} worldUpVector A normalized vector indicating the up direction of the world. (often {@link Vector3#UNIT_Y} or {@link Vector3#UNIT_Z}).
	 */
	Camera.prototype.lookAt = function (pos, worldUpVector) {
		this._newDirection.copy(pos).sub(this.translation).normalize();

		// check to see if we haven't really updated camera -- no need to call
		// sets.
		if (this._newDirection.equals(this._direction)) {
			return;
		}
		this._direction.copy(this._newDirection);

		this._up.copy(worldUpVector).normalize();
		if (this._up.equals(Vector3.ZERO)) {
			this._up.copy(Vector3.UNIT_Y);
		}
		this._left.copy(this._up).cross(this._direction).normalize();
		if (this._left.equals(Vector3.ZERO)) {
			if (this._direction.x !== 0.0) {
				this._left.set(this._direction.y, -this._direction.x, 0);
			} else {
				this._left.set(0, this._direction.z, -this._direction.y);
			}
		}
		this._up.copy(this._direction).cross(this._left).normalize();

		this.onFrameChange();
	};

	Camera.prototype.makeDirty = function () {
		this._depthRangeDirty = true;
		this._viewPortDirty = true;
	};

	/**
	 * Forces all aspect of the camera to be updated from internal values, and sets all dirty flags to true so that the next apply() call will fully
	 * set this camera to the render context.
	 */
	Camera.prototype.update = function () {
		this._depthRangeDirty = true;
		this.onFrustumChange();
		// this.onViewPortChange();
		this.onFrameChange();
	};

	/**
	 * Sets the boundaries of this camera's viewport to the given values
	 *
	 * @param left
	 * @param right
	 * @param bottom
	 * @param top
	 */
	Camera.prototype.setViewPort = function (left, right, bottom, top) {
		setViewPortLeft(left);
		setViewPortRight(right);
		setViewPortBottom(bottom);
		setViewPortTop(top);
	};

	/**
	 * Checks a bounding volume against the planes of this camera's frustum and returns if it is completely inside of, outside of, or intersecting.
	 *
	 * @param bound the bound to check for culling
	 * @return intersection type
	 */
	Camera.prototype.contains = function (bound) {
		if (!bound) {
			return Camera.Inside;
		}

		// var mask;
		var rVal = Camera.Inside;

		for (var planeCounter = Camera.FRUSTUM_PLANES - 1; planeCounter >= 0; planeCounter--) {
			// if (planeCounter === bound._checkPlane) {
			// continue; // we have already checked this plane at first iteration
			// }
			// var planeId = planeCounter == Camera.FRUSTUM_PLANES ? bound._checkPlane : planeCounter;

			// mask = 1 << planeId;
			// if ((this._planeState & mask) === 0) {
			// switch (bound.whichSide(this._worldPlane[planeId])) {
			switch (bound.whichSide(this._worldPlane[planeCounter]))
			{
			case Camera.Inside:
				// object is outside of frustum
				// bound._checkPlane = planeId;
				return Camera.Outside;
			case Camera.Outside:
				// object is visible on *this* plane, so mark this plane
				// so that we don't check it for sub nodes.
				// this._planeState |= mask;
				break;
			case Camera.Neither:
				rVal = Camera.Intersects;
				break;
			}
			// }
		}

		return rVal;
	};

	/**
	 * Updates internal frustum coefficient values to reflect the current frustum plane values.
	 */
	Camera.prototype.onFrustumChange = function () {
		if (this.projectionMode === Camera.Perspective) {
			var nearSquared = this._frustumNear * this._frustumNear;
			var leftSquared = this._frustumLeft * this._frustumLeft;
			var rightSquared = this._frustumRight * this._frustumRight;
			var bottomSquared = this._frustumBottom * this._frustumBottom;
			var topSquared = this._frustumTop * this._frustumTop;

			var inverseLength = 1.0 / Math.sqrt(nearSquared + leftSquared);
			this._coeffLeft[0] = this._frustumNear * inverseLength;
			this._coeffLeft[1] = -this._frustumLeft * inverseLength;

			inverseLength = 1.0 / Math.sqrt(nearSquared + rightSquared);
			this._coeffRight[0] = -this._frustumNear * inverseLength;
			this._coeffRight[1] = this._frustumRight * inverseLength;

			inverseLength = 1.0 / Math.sqrt(nearSquared + bottomSquared);
			this._coeffBottom[0] = this._frustumNear * inverseLength;
			this._coeffBottom[1] = -this._frustumBottom * inverseLength;

			inverseLength = 1.0 / Math.sqrt(nearSquared + topSquared);
			this._coeffTop[0] = -this._frustumNear * inverseLength;
			this._coeffTop[1] = this._frustumTop * inverseLength;
		} else if (this.projectionMode === Camera.Parallel) {
			if (this._frustumRight > this._frustumLeft) {
				this._coeffLeft[0] = -1;
				this._coeffLeft[1] = 0;

				this._coeffRight[0] = 1;
				this._coeffRight[1] = 0;
			} else {
				this._coeffLeft[0] = 1;
				this._coeffLeft[1] = 0;

				this._coeffRight[0] = -1;
				this._coeffRight[1] = 0;
			}

			if (this._frustumTop > this._frustumBottom) {
				this._coeffBottom[0] = -1;
				this._coeffBottom[1] = 0;

				this._coeffTop[0] = 1;
				this._coeffTop[1] = 0;
			} else {
				this._coeffBottom[0] = 1;
				this._coeffBottom[1] = 0;

				this._coeffTop[0] = -1;
				this._coeffTop[1] = 0;
			}
		}

		this._updatePMatrix = true;
		this._updateMVPMatrix = true;
		this._updateInverseMVMatrix = true;
		this._updateInverseMVPMatrix = true;
	};

	/**
	 * Updates the values of the world planes associated with this camera.
	 */
	Camera.prototype.onFrameChange = function () {
		var dirDotLocation = this._direction.dot(this.translation);

		var planeNormal = new Vector3();

		// left plane
		planeNormal.x = this._left.x * this._coeffLeft[0];
		planeNormal.y = this._left.y * this._coeffLeft[0];
		planeNormal.z = this._left.z * this._coeffLeft[0];
		planeNormal.add([this._direction.x * this._coeffLeft[1], this._direction.y * this._coeffLeft[1], this._direction.z * this._coeffLeft[1]]);
		this._worldPlane[Camera.LEFT_PLANE].normal.copy(planeNormal);
		this._worldPlane[Camera.LEFT_PLANE].constant = this.translation.dot(planeNormal);

		// right plane
		planeNormal.x = this._left.x * this._coeffRight[0];
		planeNormal.y = this._left.y * this._coeffRight[0];
		planeNormal.z = this._left.z * this._coeffRight[0];
		planeNormal.add([this._direction.x * this._coeffRight[1], this._direction.y * this._coeffRight[1], this._direction.z * this._coeffRight[1]]);
		this._worldPlane[Camera.RIGHT_PLANE].normal.copy(planeNormal);
		this._worldPlane[Camera.RIGHT_PLANE].constant = this.translation.dot(planeNormal);

		// bottom plane
		planeNormal.x = this._up.x * this._coeffBottom[0];
		planeNormal.y = this._up.y * this._coeffBottom[0];
		planeNormal.z = this._up.z * this._coeffBottom[0];
		planeNormal
			.add([this._direction.x * this._coeffBottom[1], this._direction.y * this._coeffBottom[1], this._direction.z * this._coeffBottom[1]]);
		this._worldPlane[Camera.BOTTOM_PLANE].normal.copy(planeNormal);
		this._worldPlane[Camera.BOTTOM_PLANE].constant = this.translation.dot(planeNormal);

		// top plane
		planeNormal.x = this._up.x * this._coeffTop[0];
		planeNormal.y = this._up.y * this._coeffTop[0];
		planeNormal.z = this._up.z * this._coeffTop[0];
		planeNormal.add([this._direction.x * this._coeffTop[1], this._direction.y * this._coeffTop[1], this._direction.z * this._coeffTop[1]]);
		this._worldPlane[Camera.TOP_PLANE].normal.copy(planeNormal);
		this._worldPlane[Camera.TOP_PLANE].constant = this.translation.dot(planeNormal);

		if (this.projectionMode === Camera.Parallel) {
			if (this._frustumRight > this._frustumLeft) {
				this._worldPlane[Camera.LEFT_PLANE].constant = this._worldPlane[Camera.LEFT_PLANE].contant + this._frustumLeft;
				this._worldPlane[Camera.RIGHT_PLANE].constant = this._worldPlane[Camera.RIGHT_PLANE].contant - this._frustumRight;
			} else {
				this._worldPlane[Camera.LEFT_PLANE].constant = this._worldPlane[Camera.LEFT_PLANE].contant - this._frustumLeft;
				this._worldPlane[Camera.RIGHT_PLANE].constant = this._worldPlane[Camera.RIGHT_PLANE].contant + this._frustumRight;
			}

			if (this._frustumBottom > this._frustumTop) {
				this._worldPlane[Camera.TOP_PLANE].constant = this._worldPlane[Camera.TOP_PLANE].contant + this._frustumTop;
				this._worldPlane[Camera.BOTTOM_PLANE].constant = this._worldPlane[Camera.BOTTOM_PLANE].contant - this._frustumBottom;
			} else {
				this._worldPlane[Camera.TOP_PLANE].constant = this._worldPlane[Camera.TOP_PLANE].contant - this._frustumTop;
				this._worldPlane[Camera.BOTTOM_PLANE].constant = this._worldPlane[Camera.BOTTOM_PLANE].contant + this._frustumBottom;
			}
		}

		// far plane
		planeNormal.copy(this._direction).invert();
		this._worldPlane[Camera.FAR_PLANE].normal.copy(planeNormal);
		this._worldPlane[Camera.FAR_PLANE].constant = -(dirDotLocation + this._frustumFar);

		// near plane
		this._worldPlane[Camera.NEAR_PLANE].normal.copy(this._direction);
		this._worldPlane[Camera.NEAR_PLANE].constant = dirDotLocation + this._frustumNear;

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

			this.projection.e00 = 2.0 / (this._frustumRight - this._frustumLeft);
			this.projection.e11 = 2.0 / (this._frustumTop - this._frustumBottom);
			this.projection.e22 = -2.0 / (this._frustumFar - this._frustumNear);
			this.projection.e03 = -(this._frustumRight + this._frustumLeft) / (this._frustumRight - this._frustumLeft);
			this.projection.e13 = -(this._frustumTop + this._frustumBottom) / (this._frustumTop - this._frustumBottom);
			this.projection.e23 = -(this._frustumFar + this._frustumNear) / (this._frustumFar - this._frustumNear);
		} else if (this.projectionMode === Camera.Perspective) {
			this.projection.setIdentity();

			this.projection.e00 = 2.0 * this._frustumNear / (this._frustumRight - this._frustumLeft);
			this.projection.e11 = 2.0 * this._frustumNear / (this._frustumTop - this._frustumBottom);
			this.projection.e02 = (this._frustumRight + this._frustumLeft) / (this._frustumRight - this._frustumLeft);
			this.projection.e12 = (this._frustumTop + this._frustumBottom) / (this._frustumTop - this._frustumBottom);
			this.projection.e22 = -(this._frustumFar + this._frustumNear) / (this._frustumFar - this._frustumNear);
			this.projection.e32 = -1.0;
			this.projection.e23 = -(2.0 * this._frustumFar * this._frustumNear) / (this._frustumFar - this._frustumNear);
			this.projection.e33 = -0.0;
		}
	};

	/**
	 * Updates the value of our model view matrix.
	 */
	Camera.prototype.updateModelViewMatrix = function () {
		this.modelView.setIdentity();

		this.modelView.e00 = -this._left.x;
		this.modelView.e01 = -this._left.y;
		this.modelView.e02 = -this._left.z;

		this.modelView.e10 = this._up.x;
		this.modelView.e11 = this._up.y;
		this.modelView.e12 = this._up.z;

		this.modelView.e20 = -this._direction.x;
		this.modelView.e21 = -this._direction.y;
		this.modelView.e22 = -this._direction.z;

		this.modelView.e03 = this._left.dot(this.translation);
		this.modelView.e13 = -this._up.dot(this.translation);
		this.modelView.e23 = this._direction.dot(this.translation);
	};

	/**
	 * Calculate a Pick Ray using the given screen position at the near plane of this camera and the camera's position in space.
	 *
	 * @param screenX the screen x position
	 * @param screenY the screen y position
	 * @param screenWidth the screen width
	 * @param screenHeight the screen height
	 * @param flipVertical if true, we'll flip the screenPosition on the y axis. This is useful when you are dealing with non-opengl coordinate
	 *            systems.
	 * @param store the Ray to store the result in. If false, a new Ray is created and returned.
	 * @return the resulting Ray.
	 */
	Camera.prototype.getPickRay = function (screenX, screenY, screenWidth, screenHeight, store) {
		if (!store) {
			store = new Ray();
		}
		var origin = new Vector3();
		var direction = new Vector3();
		this.getWorldCoordinates(screenX, screenHeight - screenY, screenWidth, screenHeight, 0, origin);
		this.getWorldCoordinates(screenX, screenHeight - screenY, screenWidth, screenHeight, 0.3, direction).sub(origin).normalize();
		store.origin.copy(origin);
		store.direction.copy(direction);

		return store;
	};

	/**
	 * Converts a local x,y screen position and depth value to world coordinates based on the current settings of this camera.
	 *
	 * @param screenX the screen x position
	 * @param screenY the screen y position
	 * @param screenWidth the screen width
	 * @param screenHeight the screen height
	 * @param zDepth the depth into the camera view to take our point. 0 indicates the near plane of the camera and 1 indicates the far plane.
	 * @param store Use to avoid object creation. if not null, the results are stored in the given vector and returned. Otherwise, a new vector is
	 *            created.
	 * @return a vector containing the world coordinates.
	 */
	Camera.prototype.getWorldCoordinates = function (screenX, screenY, screenWidth, screenHeight, zDepth, store) {
		if (!store) {
			store = new Vector3();
		}
		this.checkInverseModelViewProjection();
		var position = new Vector4();
		position.set((screenX / screenWidth - this._viewPortLeft) / (this._viewPortRight - this._viewPortLeft) * 2 - 1,
			(screenY / screenHeight - this._viewPortBottom) / (this._viewPortTop - this._viewPortBottom) * 2 - 1, zDepth * 2 - 1, 1);
		this.modelViewProjectionInverse.applyPost(position);
		position.mul(1.0 / position.w);
		store.x = position.x;
		store.y = position.y;
		store.z = position.z;

		return store;
	};

	/**
	 * Converts a position in world coordinate space to an x,y screen position and depth value using the current settings of this camera.
	 *
	 * @param worldPos the position in space to retrieve screen coordinates for.
	 * @param screenWidth the screen width
	 * @param screenHeight the screen height
	 * @param store Use to avoid object creation. if not null, the results are stored in the given vector and returned. Otherwise, a new vector is
	 *            created.
	 * @return a vector containing the screen coordinates as x and y and the distance as a percent between near and far planes.
	 */
	Camera.prototype.getScreenCoordinates = function (worldPosition, screenWidth, screenHeight, store) {
		store = this.getNormalizedDeviceCoordinates(worldPosition, store);

		store.x = (store.x + 1) * (this._viewPortRight - this._viewPortLeft) / 2 * screenWidth;
		store.y = (store.y + 1) * (this._viewPortTop - this._viewPortBottom) / 2 * screenHeight;
		store.z = (store.z + 1) / 2;

		return store;
	};

	/**
	 * Converts a position in world coordinate space to a x,y,z frustum position using the current settings of this camera.
	 *
	 * @param worldPos the position in space to retrieve frustum coordinates for.
	 * @param store Use to avoid object creation. if not null, the results are stored in the given vector and returned. Otherwise, a new vector is
	 *            created.
	 * @return a vector containing the x,y,z frustum position
	 */
	Camera.prototype.getFrustumCoordinates = function (worldPosition, store) {
		store = this.getNormalizedDeviceCoordinates(worldPosition, store);

		store.x = (store.x + 1) * (this._frustumRight - this._frustumLeft) / 2 + this._frustumLeft;
		store.y = (store.y + 1) * (this._frustumTop - this._frustumBottom) / 2 + this._frustumBottom;
		store.z = (store.z + 1) * (this._frustumFar - this._frustumNear) / 2 + this._frustumNear;

		return store;
	};

	Camera.prototype.getNormalizedDeviceCoordinates = function (worldPosition, store) {
		if (!store) {
			store = new Vector3();
		}
		this.checkModelViewProjection();
		var position = new Vector4();
		position.set(worldPosition.x, worldPosition.y, worldPosition.z, 1);
		this.modelViewProjection.applyPost(position);
		position.mul(1.0 / position.w);
		store.x = position.x;
		store.y = position.y;
		store.z = position.z;

		return store;
	};

	/**
	 * update modelView if necessary.
	 */
	Camera.prototype.checkModelView = function () {
		if (this._updateMVMatrix) {
			this.updateModelViewMatrix();
			this._updateMVMatrix = false;
		}
	};

	/**
	 * update projection if necessary.
	 */
	Camera.prototype.checkProjection = function () {
		if (this._updatePMatrix) {
			this.updateProjectionMatrix();
			this._updatePMatrix = false;
		}
	};

	/**
	 * update modelViewProjection if necessary.
	 */
	Camera.prototype.checkModelViewProjection = function () {
		if (this._updateMVPMatrix) {
			this.checkModelView();
			this.checkProjection();
			// because these are transposed, we need to flip order
			this.modelViewProjection.copy(this.getProjectionMatrix()).combine(this.getViewMatrix());
			this._updateMVPMatrix = false;
		}
	};

	/**
	 * update inverse modelView if necessary.
	 */
	Camera.prototype.checkInverseModelView = function () {
		if (this._updateInverseMVMatrix) {
			this.checkModelView();
			Matrix4x4.invert(this.modelView, this.modelViewInverse);
			this._updateInverseMVMatrix = false;
		}
	};

	/**
	 * update inverse modelViewProjection if necessary.
	 */
	Camera.prototype.checkInverseModelViewProjection = function () {
		if (this._updateInverseMVPMatrix) {
			this.checkModelViewProjection();
			Matrix4x4.invert(this.modelViewProjection, this.modelViewProjectionInverse);
			this._updateInverseMVPMatrix = false;
		}
	};

	/**
	 * Apply this camera's values to the given Renderer. Only values determined to be dirty (via updates, setters, etc.) will be applied. This method
	 * must be run in the same thread as a valid OpenGL context.
	 *
	 * @param renderer the Renderer to use.
	 */
	// TODO
	// Camera.prototype.apply = function(renderer) {
	// ContextManager.getCurrentContext().setCurrentCamera(this);
	// if (this._depthRangeDirty) {
	// renderer.setDepthRange(this._depthRangeNear, this._depthRangeFar);
	// this._depthRangeDirty = false;
	// }
	// if (this._viewPortDirty) {
	// this.applyViewport(renderer);
	// this._viewPortDirty = false;
	// }
	// };
	Camera.prototype.getViewMatrix = function () {
		this.checkModelView();
		return this.modelView;
	};

	Camera.prototype.getProjectionMatrix = function () {
		this.checkProjection();
		return this.projection;
	};

	Camera.prototype.getViewProjectionMatrix = function () {
		this.checkModelViewProjection();
		return this.modelViewProjection;
	};

	Camera.prototype.getViewInverseMatrix = function () {
		this.checkInverseModelView();
		return this.modelViewInverse;
	};

	Camera.prototype.getViewProjectionInverseMatrix = function () {
		this.checkInverseModelViewProjection();
		return this.modelViewProjectionInverse;
	};

	/**
	 * Apply the camera's viewport using the given Renderer.
	 *
	 * @param renderer the Renderer to use.
	 */
	// protected void applyViewport(final Renderer renderer) {
	// final int x = (int) (this._viewPortLeft * this._width);
	// final int y = (int) (this._viewPortBottom * this._height);
	// final int w = (int) ((this._viewPortRight - this._viewPortLeft) * this._width);
	// final int h = (int) ((this._viewPortTop - this._viewPortBottom) * this._height);
	// renderer.setViewport(x, y, w, h);
	// }
	Camera.prototype.toString = function () {
		return "com.ardor3d.renderer.Camera: loc - " + Arrays.toString(getLocation().toArray(null)) + " dir - "
			+ Arrays.toString(getDirection().toArray(null)) + " up - " + Arrays.toString(getUp().toArray(null)) + " left - "
			+ Arrays.toString(getLeft().toArray(null));
	};

	/*
	*	Returns this camera's eye direction in world space.
	*	@returns {Vector3} the direction vector
	*/
	Camera.prototype.getDirection = function () {
		return this._direction;
	};

	return Camera;
});
