define([
	'goo/util/Handy',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/math/Matrix4x4',
	'goo/math/Plane',
	'goo/math/MathUtils',
	'goo/math/Ray',
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere',
	'goo/renderer/bounds/BoundingVolume'
],
/** @lends */
function (
	Handy,
	Vector3,
	Vector4,
	Matrix4x4,
	Plane,
	MathUtils,
	Ray,
	BoundingBox,
	BoundingSphere,
	BoundingVolume
) {
	'use strict';

	/**
	 * @class This class represents a view into a 3D scene and how that view should map to a 2D rendering surface.
	 * @param {Number} [fov=45] The full vertical angle of view, in degrees.
	 * @param {Number} [aspect=1] Aspect ratio of the 3D canvas used.
	 * @param {Number} [near=1] Near plane clip distance.
	 * @param {Number} [far=1000] Far plane clip distance.
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

		this._coeffLeft = [];
		this._coeffRight = [];
		this._coeffBottom = [];
		this._coeffTop = [];

		// These need an onViewPortChange() after being modified
		this._viewPortLeft = 0.0;
		this._viewPortRight = 1.0;
		this._viewPortTop = 1.0;
		this._viewPortBottom = 0.0;

		this._worldPlane = [];
		for (var i = 0; i < Camera.FRUSTUM_PLANES; i++) {
			this._worldPlane[i] = new Plane();
		}

		this._newDirection = new Vector3();

		this.projectionMode = Camera.Perspective;
		this.lockedRatio = false;
		this.aspect = aspect;

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
		this.direction = new Vector3(); //! AT: unused
		this.left = new Vector3();
		this.up = new Vector3();
		this.planeNormal = new Vector3();

		this.changedProperties = true;

		this.setFrustumPerspective(fov, aspect, near, far);
		this.onFrameChange();
	}

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
	 * @param {Number} fov The full angle of view on the Y axis, in degrees.
	 * @param {Number} aspect The aspect ratio of our view (generally in [0,1]). Often this is canvas width / canvas height.
	 * @param {Number} near Near plane value
	 * @param {Number} far Far plane value
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

			this.onFrustumChange();
		}
	};

	/**
	 * Sets the frustum plane values of this camera using the given values.
	 *
	 * @param {Number} near
	 * @param {Number} far
	 * @param {Number} left
	 * @param {Number} right
	 * @param {Number} top
	 * @param {Number} bottom
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

		this.onFrustumChange();
	};

	/**
	 * Copy the settings of a source camera to this camera.
	 *
	 * @param {Camera} source
	 */
	Camera.prototype.copy = function (source) {
		this.translation.setv(source.translation);
		this._left.setv(source._left);
		this._up.setv(source._up);
		this._direction.setv(source._direction);

		this.fov = source.fov;
		this.aspect = source.aspect;
		this.near = source.near;
		this.far = source.far;

		this._frustumLeft = source._frustumLeft;
		this._frustumRight = source._frustumRight;
		this._frustumBottom = source._frustumBottom;
		this._frustumTop = source._frustumTop;
		this._frustumNear = source._frustumNear;
		this._frustumFar = source._frustumFar;

		this.projectionMode = source.projectionMode;

		this._depthRangeDirty = true;
		this.onFrustumChange();
		this.onFrameChange();
		// this.setFrustumPerspective();
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
	 * @param {Vector3} worldUpVector A vector indicating the up direction of the world. (often Vector3.UNIT_Y or Vector3.UNIT_Z).
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
	 * Checks a bounding volume against the planes of this camera's frustum and returns if it is completely inside of, outside of, or intersecting.
	 *
	 * @param {BoundingVolume} bound the BoundingVolume to check for culling
	 * @returns {Number} Intersection type
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

		this.changedProperties = true;
	};

	/**
	 * Updates the values of the world planes associated with this camera.
	 */
	Camera.prototype.onFrameChange = function () {
		var dirDotLocation = this._direction.dot(this.translation);

		var planeNormal = this.planeNormal;

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
		planeNormal.add([this._direction.x * this._coeffBottom[1], this._direction.y * this._coeffBottom[1], this._direction.z * this._coeffBottom[1]]);
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
	 * @param {Number} screenX the screen x position
	 * @param {Number} screenY the screen y position
	 * @param {Number} screenWidth the screen width
	 * @param {Number} screenHeight the screen height
	 * @param {Ray} [store] the Ray to store the result in. If false, a new Ray is created and returned.
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
	 * Converts a local x,y screen position and depth value to world coordinates based on the current settings of this camera.
	 *
	 * @param {Number} screenX the screen x position
	 * @param {Number} screenY the screen y position
	 * @param {Number} screenWidth the screen width
	 * @param {Number} screenHeight the screen height
	 * @param {Number} zDepth the depth into the camera view to take our point in world distance.
	 * @param {Vector3} [store] Use to avoid object creation. if not null, the results are stored in the given vector and returned. Otherwise, a new vector is
	 *            created.
	 * @returns {Vector3} Vector containing the world coordinates.
	 */
	Camera.prototype.getWorldPosition = function (screenX, screenY, screenWidth, screenHeight, zDepth, store) {
		if (!store) {
			store = new Vector3();
		}

		if (this.projectionMode === Camera.Parallel) {
			zDepth = ((zDepth - this.near) / (this.far - this.near));
		} else {
			// http://www.sjbaker.org/steve/omniv/love_your_z_buffer.html
			zDepth = (this.far / (this.far - this.near)) + ((this.far * this.near / (this.near - this.far)) / zDepth);
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

		var z = zDepth * 2 - 1;
		var w = 1;
		position.set(x, y, z, w);
		this.modelViewProjectionInverse.applyPost(position);
		position.mul(1.0 / position.w);

		store.x = position.x;
		store.y = position.y;
		store.z = position.z;

		return store;
	};

	/**
	 * Converts a local x,y screen position and depth value to world coordinates based on the current settings of this camera.
	 *
	 * @param screenX the screen x position (x=0 is the leftmost coordinate of the screen)
	 * @param screenY the screen y position (y=0 is the top of the screen)
	 * @param screenWidth the screen width
	 * @param screenHeight the screen height
	 * @param zDepth the depth into the camera view to take our point. 0 indicates the near plane of the camera and 1 indicates the far plane.
	 * @param [store] Use to avoid object creation. if not null, the results are stored in the given vector and returned. Otherwise, a new vector is
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

		position.set(x, y, zDepth * 2 - 1, 1);
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
	 * @param [store] Use to avoid object creation. if not null, the results are stored in the given vector and returned. Otherwise, a new vector is
	 *            created.
	 * @returns {Vector3} Vector containing the screen coordinates as x and y and the distance as a percent between near and far planes.
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
	 * Converts a position in world coordinate space to a x,y,z frustum position using the current settings of this camera.
	 *
	 * @param worldPos the position in space to retrieve frustum coordinates for.
	 * @param [store] Use to avoid object creation. if not null, the results are stored in the given vector and returned. Otherwise, a new vector is created.
	 * @returns {Vector3} Vector containing the x, y and z frustum position.
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
	 * Update modelView if necessary.
	 */
	Camera.prototype.checkModelView = function () {
		if (this._updateMVMatrix) {
			this.updateModelViewMatrix();
			this._updateMVMatrix = false;
		}
	};

	/**
	 * Update projection if necessary.
	 */
	Camera.prototype.checkProjection = function () {
		if (this._updatePMatrix) {
			this.updateProjectionMatrix();
			this._updatePMatrix = false;
		}
	};

	/**
	 * Update modelViewProjection if necessary.
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
	 * Update inverse modelView if necessary.
	 */
	Camera.prototype.checkInverseModelView = function () {
		if (this._updateInverseMVMatrix) {
			this.checkModelView();
			Matrix4x4.invert(this.modelView, this.modelViewInverse);
			this._updateInverseMVMatrix = false;
		}
	};

	/**
	 * Update inverse modelViewProjection if necessary.
	 */
	Camera.prototype.checkInverseModelViewProjection = function () {
		if (this._updateInverseMVPMatrix) {
			this.checkModelViewProjection();
			Matrix4x4.invert(this.modelViewProjection, this.modelViewProjectionInverse);
			this._updateInverseMVPMatrix = false;
		}
	};

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
	 * Compress this camera's near and far frustum planes to be smaller if possible, 
	 * using the given bounds as a measure.
	 * @param sceneBounds The scene bounds
	 */
	Camera.prototype.pack = function (sceneBounds) {
		var center = sceneBounds.center;
		var corners = this._corners;
		var extents = this._extents;

		for (var i = 0; i < corners.length; i++) {
			corners[i].set(center);
		}

		if (sceneBounds instanceof BoundingBox) {
			extents.setd(sceneBounds.xExtent, sceneBounds.yExtent, sceneBounds.zExtent);
		} else if (sceneBounds instanceof BoundingSphere) {
			extents.setd(sceneBounds.radius, sceneBounds.radius, sceneBounds.radius);
		}

		corners[0].add_d(extents.x, extents.y, extents.z);
		corners[1].add_d(extents.x, -extents.y, extents.z);
		corners[2].add_d(extents.x, extents.y, -extents.z);
		corners[3].add_d(extents.x, -extents.y, -extents.z);
		corners[4].add_d(-extents.x, extents.y, extents.z);
		corners[5].add_d(-extents.x, -extents.y, extents.z);
		corners[6].add_d(-extents.x, extents.y, -extents.z);
		corners[7].add_d(-extents.x, -extents.y, -extents.z);

		var mvMatrix = this.getViewMatrix();
		var optimalCameraNear = Number.MAX_VALUE;
		var optimalCameraFar = -Number.MAX_VALUE;
		var position = new Vector4();
		for (var i = 0; i < corners.length; i++) {
			position.setd(corners[i].x, corners[i].y, corners[i].z, 1);
			mvMatrix.applyPre(position);

			optimalCameraNear = Math.min(-position.z, optimalCameraNear);
			optimalCameraFar = Math.max(-position.z, optimalCameraFar);
		}

		// XXX: use of getFrustumNear and getFrustumFar seems suspicious...
		// XXX: It depends on the frustum being reset each update
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
		var direction = this.direction;
		var left = this.left;
		var up = this.up;

		direction.setv(this._direction).mul(fNear);
		vNearPlaneCenter.setv(this.translation).addv(direction);
		direction.setv(this._direction).mul(fFar);
		vFarPlaneCenter.setv(this.translation).addv(direction);

		left.setv(this._left).mul(fNearPlaneWidth);
		up.setv(this._up).mul(fNearPlaneHeight);
		this._corners[0].setv(vNearPlaneCenter).subv(left).subv(up);
		this._corners[1].setv(vNearPlaneCenter).addv(left).subv(up);
		this._corners[2].setv(vNearPlaneCenter).addv(left).addv(up);
		this._corners[3].setv(vNearPlaneCenter).subv(left).addv(up);

		left.setv(this._left).mul(fFarPlaneWidth);
		up.setv(this._up).mul(fFarPlaneHeight);
		this._corners[4].setv(vFarPlaneCenter).subv(left).subv(up);
		this._corners[5].setv(vFarPlaneCenter).addv(left).subv(up);
		this._corners[6].setv(vFarPlaneCenter).addv(left).addv(up);
		this._corners[7].setv(vFarPlaneCenter).subv(left).addv(up);

		return this._corners;
	};

	/**
	 * Clipping using oblique frustums
	 * @param clipPlane Clipping plane
	 * @param offset Offset
	 */
	Camera.prototype.setToObliqueMatrix = function (clipPlaneOrig, offset) {
		offset = offset || 0;
		var clipPlane = this._clipPlane.setv(clipPlaneOrig);

		this.getViewMatrix().applyPost(clipPlane);
		clipPlane.w = this.translation.y * clipPlaneOrig.y + offset;

		this._updatePMatrix = true;
		var projection = this.getProjectionMatrix();

		this._qCalc.setd(
			(MathUtils.sign(clipPlane.x) + projection[8]) / projection[0],
			(MathUtils.sign(clipPlane.y) + projection[9]) / projection[5],
			-1,
			(1.0 + projection[10]) / projection[14]
		);

		clipPlane.mul(2.0 / Vector4.dot(clipPlane, this._qCalc));

		projection[2] = clipPlane.x;
		projection[6] = clipPlane.y;
		projection[10] = clipPlane.z + 1.0;
		projection[14] = clipPlane.w;

		this._updateMVPMatrix = true;
		this._updateInverseMVPMatrix = true;
	};

	return Camera;
});