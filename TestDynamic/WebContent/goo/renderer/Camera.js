define(['goo/util/Handy', 'goo/math/Vector3', 'goo/math/Matrix4x4', 'goo/renderer/Plane'],
	function(Handy, Vector3, Matrix4x4, Plane) {
		"use strict";

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
		 * MAX_WORLD_PLANES holds the maximum planes allowed by the system.
		 */
		Camera.MAX_WORLD_PLANES = 32;

		function Camera(fov, aspect, near, far) {
			// TODO: these needs onFrameChange() after change
			this._location = new Vector3(0, 0, 0);
			this._left = new Vector3(-1, 0, 0);
			this._up = new Vector3(0, 1, 0);
			this._direction = new Vector3(0, 0, -1);

			Handy.defineProperty(this, 'this._depthRangeNear', 0.0, function() {
				this._depthRangeDirty = true;
			});
			Handy.defineProperty(this, 'this._depthRangeFar', 1.0, function() {
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

			// Handy.defineProperty(this, 'this._frustumNear', 1.0, function() {
			// onFrustumChange();
			// });
			// Handy.defineProperty(this, 'this._frustumFar', 2.0, function() {
			// onFrustumChange();
			// });
			// Handy.defineProperty(this, 'this._frustumLeft', -0.5, function() {
			// onFrustumChange();
			// });
			// Handy.defineProperty(this, 'this._frustumRight', 0.5, function() {
			// onFrustumChange();
			// });
			// Handy.defineProperty(this, 'this._frustumTop', 0.5, function() {
			// onFrustumChange();
			// });
			// Handy.defineProperty(this, 'this._frustumBottom', -0.5, function() {
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
			for ( var i = 0; i < Camera.MAX_WORLD_PLANES; i++) {
				this._worldPlane[i] = new Plane();
			}

			this._newDirection = new Vector3();

			this._projectionMode = Camera.Perspective;

			this._updateMVMatrix = true;
			this._updatePMatrix = true;
			this._updateMVPMatrix = true;
			this._updateInverseMVPMatrix = true;

			// NB: These matrices are column-major.
			this._modelView = new Matrix4x4();
			Handy.addListener(this, 'this._modelView', function() {
				checkModelView();
			}, undefined);
			this._projection = new Matrix4x4();
			Handy.addListener(this, 'this._projection', function() {
				checkProjection();
			}, undefined);
			this._modelViewProjection = new Matrix4x4();
			Handy.addListener(this, 'this._modelViewProjection', function() {
				checkModelViewProjection();
			}, undefined);
			this._modelViewProjectionInverse = new Matrix4x4();
			Handy.addListener(this, 'this._modelViewProjectionInverse', function() {
				checkInverseModelViewProjection();
			}, undefined);

			this._depthRangeDirty = true;
			this._viewPortDirty = true;

			this._planeState = 0;

			this.onFrustumChange();
			// this.onViewPortChange();
			this.onFrameChange();

			console.log('Camera created');
		}

		/**
		 * Ensure our up, left and direction are unit-length vectors.
		 */
		Camera.prototype.normalize = function() {
			this._left.normalizeLocal();
			this._up.normalizeLocal();
			this._direction.normalizeLocal();
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
		Camera.prototype.setFrustumPerspective = function(fovY, aspect, near, far) {
			if (Number.isNaN(aspect) || Number.isInfinite(aspect)) {
				// ignore.
				console.warn("Invalid aspect given to setFrustumPerspective: " + aspect);
				return;
			}

			this._fovY = fovY;
			var h = Math.tan(this._fovY * MathUtils.DEG_TO_RAD * 0.5) * near;
			var w = h * aspect;
			this._frustumLeft = -w;
			this._frustumRight = w;
			this._frustumBottom = -h;
			this._frustumTop = h;
			this._frustumNear = near;
			this._frustumFar = far;

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
		Camera.prototype.setFrame = function(location, left, up, direction) {
			this._left.set(left);
			this._up.set(up);
			this._direction.set(direction);
			this._location.set(location);

			this.onFrameChange();
		};

		/**
		 * A convenience method for auto-setting the frame based on a world position the user desires the camera to look at. It points the camera
		 * towards the given position using the difference between that position and the current camera location as a direction vector and the general
		 * worldUpVector to compute up and left camera vectors.
		 * 
		 * @param pos where to look at in terms of world coordinates
		 * @param worldUpVector a normalized vector indicating the up direction of the world. (often {@link Vector3#UNIT_Y} or {@link Vector3#UNIT_Z})
		 */
		Camera.prototype.lookAt = function(pos, worldUpVector) {
			lookAt(pos.x, pos.y, pos.z, worldUpVector);
		};

		/**
		 * A convenience method for auto-setting the frame based on a world position the user desires the camera to look at. It points the camera
		 * towards the given position using the difference between that position and the current camera location as a direction vector and the general
		 * worldUpVector to compute up and left camera vectors.
		 * 
		 * @param x where to look at in terms of world coordinates (x)
		 * @param y where to look at in terms of world coordinates (y)
		 * @param z where to look at in terms of world coordinates (z)
		 * @param worldUpVector a normalized vector indicating the up direction of the world. (often {@link Vector3#UNIT_Y} or {@link Vector3#UNIT_Z})
		 */
		Camera.prototype.lookAt = function(x, y, z, worldUpVector) {
			this._newDirection.set(x, y, z).subtractLocal(this._location).normalizeLocal();

			// check to see if we haven't really updated camera -- no need to call
			// sets.
			if (this._newDirection.equals(this._direction)) {
				return;
			}
			this._direction.set(this._newDirection);

			this._up.set(worldUpVector).normalizeLocal();
			if (this._up.equals(Vector3.ZERO)) {
				this._up.set(Vector3.UNIT_Y);
			}
			this._left.set(this._up).crossLocal(this._direction).normalizeLocal();
			if (this._left.equals(Vector3.ZERO)) {
				if (this._direction.x != 0.0) {
					this._left.set(this._direction.y, -this._direction.x, 0);
				} else {
					this._left.set(0, this._direction.z, -this._direction.y);
				}
			}
			this._up.set(this._direction).crossLocal(this._left).normalizeLocal();

			this.onFrameChange();
		};

		Camera.prototype.makeDirty = function() {
			this._depthRangeDirty = true;
			this._viewPortDirty = true;
		};

		/**
		 * Forces all aspect of the camera to be updated from internal values, and sets all dirty flags to true so that the next apply() call will
		 * fully set this camera to the render context.
		 */
		Camera.prototype.update = function() {
			this._depthRangeDirty = true;
			onFrustumChange();
			onViewPortChange();
			onFrameChange();
		};

		/**
		 * Sets the boundaries of this camera's viewport to the given values
		 * 
		 * @param left
		 * @param right
		 * @param bottom
		 * @param top
		 */
		Camera.prototype.setViewPort = function(left, right, bottom, top) {
			setViewPortLeft(left);
			setViewPortRight(right);
			setViewPortBottom(bottom);
			setViewPortTop(top);
		};

		/**
		 * Checks a bounding volume against the planes of this camera's frustum and returns if it is completely inside of, outside of, or
		 * intersecting.
		 * 
		 * @param bound the bound to check for culling
		 * @return intersection type
		 */
		Camera.prototype.contains = function(bound) {
			if (!bound) {
				return Camera.Inside;
			}

			var mask;
			var rVal = Camera.Inside;

			for ( var planeCounter = Camera.FRUSTUM_PLANES; planeCounter >= 0; planeCounter--) {
				if (planeCounter == bound.getCheckPlane()) {
					continue; // we have already checked this plane at first iteration
				}
				var planeId = planeCounter == Camera.FRUSTUM_PLANES ? bound.getCheckPlane() : planeCounter;

				mask = 1 << planeId;
				if ((this._planeState & mask) == 0) {
					switch (bound.whichSide(this._worldPlane[planeId])) {
						case Camera.Inside:
							// object is outside of frustum
							bound.setCheckPlane(planeId);
							return FrustumIntersect.Outside;
						case Camera.Outside:
							// object is visible on *this* plane, so mark this plane
							// so that we don't check it for sub nodes.
							this._planeState |= mask;
							break;
						case Camera.Neither:
							rVal = FrustumIntersect.Intersects;
							break;
					}
				}
			}

			return rVal;
		};

		/**
		 * Updates internal frustum coefficient values to reflect the current frustum plane values.
		 */
		Camera.prototype.onFrustumChange = function() {
			if (this._projectionMode == Camera.Perspective) {
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
			} else if (this._projectionMode === Camera.Parallel) {
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
			this._updateInverseMVPMatrix = true;
		};

		/**
		 * Updates the values of the world planes associated with this camera.
		 */
		Camera.prototype.onFrameChange = function() {
			var dirDotLocation = this._direction.dot(this._location);

			var planeNormal = new Vector3();

			// left plane
			planeNormal.x = (this._left.x * this._coeffLeft[0]);
			planeNormal.y = (this._left.y * this._coeffLeft[0]);
			planeNormal.z = (this._left.z * this._coeffLeft[0]);
			planeNormal.add(this._direction.x * this._coeffLeft[1], this._direction.y * this._coeffLeft[1], this._direction.z * this._coeffLeft[1]);
			this._worldPlane[Camera.LEFT_PLANE].setNormal(planeNormal);
			this._worldPlane[Camera.LEFT_PLANE].setConstant(this._location.dot(planeNormal));

			// right plane
			planeNormal.x = (this._left.x * this._coeffRight[0]);
			planeNormal.y = (this._left.y * this._coeffRight[0]);
			planeNormal.z = (this._left.z * this._coeffRight[0]);
			planeNormal
				.add(this._direction.x * this._coeffRight[1], this._direction.y * this._coeffRight[1], this._direction.z * this._coeffRight[1]);
			this._worldPlane[Camera.RIGHT_PLANE].setNormal(planeNormal);
			this._worldPlane[Camera.RIGHT_PLANE].setConstant(this._location.dot(planeNormal));

			// bottom plane
			planeNormal.x = (this._up.x * this._coeffBottom[0]);
			planeNormal.y = (this._up.y * this._coeffBottom[0]);
			planeNormal.z = (this._up.z * this._coeffBottom[0]);
			planeNormal.add(this._direction.x * this._coeffBottom[1], this._direction.y * this._coeffBottom[1], this._direction.z
				* this._coeffBottom[1]);
			this._worldPlane[Camera.BOTTOM_PLANE].setNormal(planeNormal);
			this._worldPlane[Camera.BOTTOM_PLANE].setConstant(this._location.dot(planeNormal));

			// top plane
			planeNormal.x = (this._up.x * this._coeffTop[0]);
			planeNormal.y = (this._up.y * this._coeffTop[0]);
			planeNormal.z = (this._up.z * this._coeffTop[0]);
			planeNormal.add(this._direction.x * this._coeffTop[1], this._direction.y * this._coeffTop[1], this._direction.z * this._coeffTop[1]);
			this._worldPlane[Camera.TOP_PLANE].setNormal(planeNormal);
			this._worldPlane[Camera.TOP_PLANE].setConstant(this._location.dot(planeNormal));

			if (getProjectionMode() == ProjectionMode.Parallel) {
				if (this._frustumRight > this._frustumLeft) {
					this._worldPlane[Camera.LEFT_PLANE].setConstant(this._worldPlane[Camera.LEFT_PLANE].getConstant() + this._frustumLeft);
					this._worldPlane[Camera.RIGHT_PLANE].setConstant(this._worldPlane[Camera.RIGHT_PLANE].getConstant() - this._frustumRight);
				} else {
					this._worldPlane[Camera.LEFT_PLANE].setConstant(this._worldPlane[Camera.LEFT_PLANE].getConstant() - this._frustumLeft);
					this._worldPlane[Camera.RIGHT_PLANE].setConstant(this._worldPlane[Camera.RIGHT_PLANE].getConstant() + this._frustumRight);
				}

				if (this._frustumBottom > this._frustumTop) {
					this._worldPlane[Camera.TOP_PLANE].setConstant(this._worldPlane[Camera.TOP_PLANE].getConstant() + this._frustumTop);
					this._worldPlane[Camera.BOTTOM_PLANE].setConstant(this._worldPlane[Camera.BOTTOM_PLANE].getConstant() - this._frustumBottom);
				} else {
					this._worldPlane[Camera.TOP_PLANE].setConstant(this._worldPlane[Camera.TOP_PLANE].getConstant() - this._frustumTop);
					this._worldPlane[Camera.BOTTOM_PLANE].setConstant(this._worldPlane[Camera.BOTTOM_PLANE].getConstant() + this._frustumBottom);
				}
			}

			// far plane
			planeNormal.set(this._direction).negateLocal();
			this._worldPlane[Camera.FAR_PLANE].setNormal(planeNormal);
			this._worldPlane[Camera.FAR_PLANE].setConstant(-(dirDotLocation + this._frustumFar));

			// near plane
			this._worldPlane[Camera.NEAR_PLANE].setNormal(this._direction);
			this._worldPlane[Camera.NEAR_PLANE].setConstant(dirDotLocation + this._frustumNear);

			this._updateMVMatrix = true;
			this._updateMVPMatrix = true;
			this._updateInverseMVPMatrix = true;
		};

		/**
		 * Updates the value of our projection matrix.
		 */
		Camera.prototype.updateProjectionMatrix = function() {
			if (getProjectionMode() == ProjectionMode.Parallel) {
				this._projection.setIdentity();
				this._projection.setValue(0, 0, 2.0 / (this._frustumRight - this._frustumLeft));
				this._projection.setValue(1, 1, 2.0 / (this._frustumTop - this._frustumBottom));
				this._projection.setValue(2, 2, -2.0 / (this._frustumFar - this._frustumNear));
				this._projection.setValue(3, 0, -(this._frustumRight + this._frustumLeft) / (this._frustumRight - this._frustumLeft));
				this._projection.setValue(3, 1, -(this._frustumTop + this._frustumBottom) / (this._frustumTop - this._frustumBottom));
				this._projection.setValue(3, 2, -(this._frustumFar + this._frustumNear) / (this._frustumFar - this._frustumNear));
			} else if (getProjectionMode() == ProjectionMode.Perspective) {
				this._projection.setIdentity();
				this._projection.setValue(0, 0, 2.0 * this._frustumNear / (this._frustumRight - this._frustumLeft));
				this._projection.setValue(1, 1, 2.0 * this._frustumNear / (this._frustumTop - this._frustumBottom));
				this._projection.setValue(2, 0, (this._frustumRight + this._frustumLeft) / (this._frustumRight - this._frustumLeft));
				this._projection.setValue(2, 1, (this._frustumTop + this._frustumBottom) / (this._frustumTop - this._frustumBottom));
				this._projection.setValue(2, 2, -(this._frustumFar + this._frustumNear) / (this._frustumFar - this._frustumNear));
				this._projection.setValue(2, 3, -1.0);
				this._projection.setValue(3, 2, -(2.0 * this._frustumFar * this._frustumNear) / (this._frustumFar - this._frustumNear));
				this._projection.setValue(3, 3, -0.0);
			}

			this._updatePMatrix = false;
		};

		/**
		 * @return this camera's 4x4 projection matrix.
		 */
		Camera.prototype.getProjectionMatrix = function() {
			this.checkProjection();

			return this._projection;
		};

		/**
		 * Updates the value of our model view matrix.
		 */
		Camera.prototype.updateModelViewMatrix = function() {
			this._modelView.setIdentity();
			this._modelView.setValue(0, 0, -this._left.x);
			this._modelView.setValue(1, 0, -this._left.y);
			this._modelView.setValue(2, 0, -this._left.z);

			this._modelView.setValue(0, 1, this._up.x);
			this._modelView.setValue(1, 1, this._up.y);
			this._modelView.setValue(2, 1, this._up.z);

			this._modelView.setValue(0, 2, -this._direction.x);
			this._modelView.setValue(1, 2, -this._direction.y);
			this._modelView.setValue(2, 2, -this._direction.z);

			this._modelView.setValue(3, 0, this._left.dot(this._location));
			this._modelView.setValue(3, 1, -this._up.dot(this._location));
			this._modelView.setValue(3, 2, this._direction.dot(this._location));
		};

		/**
		 * @return this camera's 4x4 model view matrix.
		 */
		Camera.prototype.getModelViewMatrix = function() {
			this.checkModelView();

			return this._modelView;
		};

		/**
		 * @return this camera's 4x4 model view X projection matrix.
		 */
		Camera.prototype.getModelViewProjectionMatrix = function() {
			this.checkModelViewProjection();

			return this._modelViewProjection;
		};

		/**
		 * @return the inverse of this camera's 4x4 model view X projection matrix.
		 */
		Camera.prototype.getModelViewProjectionInverseMatrix = function() {
			this.checkInverseModelViewProjection();

			return this._modelViewProjectionInverse;
		};

		/**
		 * Calculate a Pick Ray using the given screen position at the near plane of this camera and the camera's position in space.
		 * 
		 * @param screenX the x position on the near space to pass the ray through.
		 * @param screenY the y position on the near space to pass the ray through.
		 * @param flipVertical if true, we'll flip the screenPosition on the y axis. This is useful when you are dealing with non-opengl coordinate
		 *            systems.
		 * @param store the Ray to store the result in. If false, a new Ray is created and returned.
		 * @return the resulting Ray.
		 */
		Camera.prototype.getPickRay = function(screenX, screenY, flipVertical, store) {
			var pos = new Vector2().set(screenX, screenY);
			if (flipVertical) {
				pos.y = (getHeight() - screenY);
			}

			var result = store;
			if (result == null) {
				result = new Ray3();
			}
			var origin = new Vector3();
			var direction = new Vector3();
			getWorldCoordinates(pos, 0, origin);
			getWorldCoordinates(pos, 0.3, direction).subtractLocal(origin).normalizeLocal();
			result.setOrigin(origin);
			result.setDirection(direction);
			return result;
		};

		/**
		 * Converts a local x,y screen position and depth value to world coordinates based on the current settings of this camera.
		 * 
		 * @param screenPosition the x,y coordinates of the screen position
		 * @param zDepth the depth into the camera view to take our point. 0 indicates the near plane of the camera and 1 indicates the far plane.
		 * @param store Use to avoid object creation. if not null, the results are stored in the given vector and returned. Otherwise, a new vector is
		 *            created.
		 * @return a vector containing the world coordinates.
		 */
		Camera.prototype.getWorldCoordinates = function(screenPosition, zDepth, store) {
			if (store == null) {
				store = new Vector3();
			}
			checkInverseModelViewProjection();
			var position = new Vector4();
			position.set((screenPosition.x / getWidth() - this._viewPortLeft) / (this._viewPortRight - this._viewPortLeft) * 2 - 1, (screenPosition.y
				/ getHeight() - this._viewPortBottom)
				/ (this._viewPortTop - this._viewPortBottom) * 2 - 1, zDepth * 2 - 1, 1);
			this._modelViewProjectionInverse.applyPre(position, position);
			position.multiplyLocal(1.0 / position.getW());
			store.x = (position.x);
			store.y = (position.y);
			store.z = (position.z);

			return store;
		};

		/**
		 * Converts a position in world coordinate space to an x,y screen position and depth value using the current settings of this camera.
		 * 
		 * @param worldPos the position in space to retrieve screen coordinates for.
		 * @param store Use to avoid object creation. if not null, the results are stored in the given vector and returned. Otherwise, a new vector is
		 *            created.
		 * @return a vector containing the screen coordinates as x and y and the distance as a percent between near and far planes.
		 */
		Camera.prototype.getScreenCoordinates = function(worldPosition, store) {
			store = getNormalizedDeviceCoordinates(worldPosition, store);

			store.x = ((store.x + 1) * (this._viewPortRight - this._viewPortLeft) / 2 * getWidth());
			store.y = ((store.y + 1) * (this._viewPortTop - this._viewPortBottom) / 2 * getHeight());
			store.z = ((store.z + 1) / 2);

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
		Camera.prototype.getFrustumCoordinates = function(worldPosition, store) {
			store = getNormalizedDeviceCoordinates(worldPosition, store);

			store.x = ((store.x + 1) * (this._frustumRight - this._frustumLeft) / 2 + this._frustumLeft);
			store.y = ((store.y + 1) * (this._frustumTop - this._frustumBottom) / 2 + this._frustumBottom);
			store.z = ((store.z + 1) * (this._frustumFar - this._frustumNear) / 2 + this._frustumNear);

			return store;
		};

		Camera.prototype.getNormalizedDeviceCoordinates = function(worldPosition, store) {
			if (store == null) {
				store = new Vector3();
			}
			this.checkModelViewProjection();
			var position = new Vector4();
			position.set(worldPosition.x, worldPosition.y, worldPosition.z, 1);
			this._modelViewProjection.applyPre(position, position);
			position.multiplyLocal(1.0 / position.getW());
			store.x = (position.x);
			store.y = (position.y);
			store.z = (position.z);

			return store;
		};

		/**
		 * update modelView if necessary.
		 */
		Camera.prototype.checkModelView = function() {
			if (this._updateMVMatrix) {
				this.updateModelViewMatrix();
				this._updateMVMatrix = false;
			}
		};

		/**
		 * update projection if necessary.
		 */
		Camera.prototype.checkProjection = function() {
			if (this._updatePMatrix) {
				this.updateProjectionMatrix();
				this._updatePMatrix = false;
			}
		};

		/**
		 * update modelViewProjection if necessary.
		 */
		Camera.prototype.checkModelViewProjection = function() {
			if (this._updateMVPMatrix) {
				this.checkModelView();
				this.checkProjection();
				this._modelViewProjection.set(getModelViewMatrix()).multiplyLocal(getProjectionMatrix());
				this._updateMVPMatrix = false;
			}
		};

		/**
		 * update inverse modelViewProjection if necessary.
		 */
		Camera.prototype.checkInverseModelViewProjection = function() {
			if (this._updateInverseMVPMatrix) {
				checkModelViewProjection();
				this._modelViewProjection.invert(this._modelViewProjectionInverse);
				this._updateInverseMVPMatrix = false;
			}
		};

		/**
		 * Apply this camera's values to the given Renderer. Only values determined to be dirty (via updates, setters, etc.) will be applied. This
		 * method must be run in the same thread as a valid OpenGL context.
		 * 
		 * @param renderer the Renderer to use.
		 */
		Camera.prototype.apply = function(renderer) {
			ContextManager.getCurrentContext().setCurrentCamera(this);
			if (this._depthRangeDirty) {
				renderer.setDepthRange(this._depthRangeNear, this._depthRangeFar);
				this._depthRangeDirty = false;
			}
			if (this._viewPortDirty) {
				this.applyViewport(renderer);
				this._viewPortDirty = false;
			}
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
		Camera.prototype.toString = function() {
			return "com.ardor3d.renderer.Camera: loc - " + Arrays.toString(getLocation().toArray(null)) + " dir - "
				+ Arrays.toString(getDirection().toArray(null)) + " up - " + Arrays.toString(getUp().toArray(null)) + " left - "
				+ Arrays.toString(getLeft().toArray(null));
		};

		return Camera;
	});