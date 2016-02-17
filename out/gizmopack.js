goo.Gizmo = (function (
	ShaderBuilder,
	MeshData,
	Shader,
	Material,
	Renderer,
	Transform,
	Matrix4,
	Plane,
	Ray,
	Vector3,
	Camera,
	MathUtils
) {
	'use strict';

	/**
	 * @hidden
	 */
	function Gizmo(name) {
		this.name = name;

		this._plane = new Plane();
		this._line = new Vector3();
		this._activeHandle = null;

		this.visible = false;

		this.transform = new Transform();
		this.renderables = [];
		this.onChange = null;
	}

	Gizmo.handleStore = [];

	Gizmo.registerHandle = function (handle) {
		var retVal = Gizmo.handleStore.length + 16000;
		Gizmo.handleStore.push(handle);
		return retVal;
	};

	Gizmo.getHandle = function (id) {
		if (id < 16000) {
			return null;
		}
		return Gizmo.handleStore[id - 16000];
	};

	Gizmo.prototype.getRenderable = function (id) {
		for (var i = 0; i < this.renderables.length; i++) {
			var renderable = this.renderables[i];
			if (renderable.id === id) {
				return renderable;
			}
		}
	};

	/**
	 * Turns snapping on or off
	 * @param {boolean} snap
	 */
	Gizmo.prototype.setSnap = function (snap) {
		this._snap = snap;
	};

	Gizmo.prototype.activate = function (properties) {
		this._activeHandle = properties.data;

		this._activeRenderable = this.getRenderable(properties.id);

		this._activeRenderable.materials[0].uniforms.color = [1, 1, 0]; //! AT: hardcoded pure yellow
	};

	Gizmo.prototype.deactivate = function () {
		if (this._activeRenderable) {
			var originalColor = this._activeRenderable.originalColor;
			this._activeRenderable.materials[0].uniforms.color = originalColor.slice();
		}
	};

	Gizmo.prototype.copyTransform = function (transform) {
		this.transform.setIdentity();
		if (transform) {
			transform.matrix.getTranslation(this.transform.translation);
			this.transform.rotation.copy(transform.rotation);
			this.updateTransforms();
		}
	};

	Gizmo.prototype._postProcess = function (data) {
		this.updateTransforms();

		if (this.onChange instanceof Function) {
			this.onChange(data);
		}
	};

	/**
	 * Update the transform of the provided renderable.
	 * @param renderable
	 */
	Gizmo.prototype.updateRenderableTransform = function (renderable) {
		renderable.transform.matrix.mul2(
			this.transform.matrix,
			renderable.transform.matrix
		);
	};

	var GIZMO_SIZE = 1 / 60;

	/**
	 * Updates the transforms of the renderables of this gizmo.
	 * Scale adjustment is also performed.
	 */
	Gizmo.prototype.updateTransforms = function () {
		if (Renderer.mainCamera) {
			var camera = Renderer.mainCamera;
			var scale;
			if (camera.projectionMode === Camera.Perspective) {
				var dist = camera.translation.distance(this.transform.translation);
				scale = dist * GIZMO_SIZE;
				scale *= Math.tan(camera.fov * MathUtils.DEG_TO_RAD / 2) * 2;
			} else {
				scale = (camera._frustumTop - camera._frustumBottom) / 30;
			}
			this.transform.scale.setDirect(scale, scale, scale);
		}

		this.transform.update();

		for (var i = this.renderables.length - 1; i >= 0; i--) {
			this.renderables[i].transform.update();
			this.updateRenderableTransform(this.renderables[i]);
		}
	};

	(function () {
		var worldCenter = new Vector3();
		var worldX = new Vector3();
		var worldY = new Vector3();
		var worldZ = new Vector3();
		var screenCenter = new Vector3();
		var screenX = new Vector3();
		var screenY = new Vector3();
		var screenZ = new Vector3();

		Gizmo.prototype._setPlane = function () {
			var normal = this._plane.normal;

			if (this._activeHandle.type === 'Plane') {
				// Calculate plane's normal in world space
				normal.copy([Vector3.UNIT_X, Vector3.UNIT_Y, Vector3.UNIT_Z][this._activeHandle.axis]);
				normal.applyPostVector(this.transform.matrix);
				normal.normalize();

				// Set plane distance from world origin by projecting world translation to plane normal
				worldCenter.copy(Vector3.ZERO);
				worldCenter.applyPostPoint(this.transform.matrix);

				this._plane.constant = worldCenter.dot(normal);
			} else {
				// Get gizmo handle points in world space
				worldCenter.copy(Vector3.ZERO);
				worldCenter.applyPostPoint(this.transform.matrix);

				worldX.copy(Vector3.UNIT_X);
				worldX.applyPostPoint(this.transform.matrix);

				worldY.copy(Vector3.UNIT_Y);
				worldY.applyPostPoint(this.transform.matrix);

				worldZ.copy(Vector3.UNIT_Z);
				worldZ.applyPostPoint(this.transform.matrix);

				// Gizmo handle points in screen space
				Renderer.mainCamera.getScreenCoordinates(worldCenter, 1, 1, screenCenter);
				Renderer.mainCamera.getScreenCoordinates(worldX, 1, 1, screenX);
				screenX.sub(screenCenter);
				Renderer.mainCamera.getScreenCoordinates(worldY, 1, 1, screenY);
				screenY.sub(screenCenter);
				Renderer.mainCamera.getScreenCoordinates(worldZ, 1, 1, screenZ);
				screenZ.sub(screenCenter);

				// when dragging on a line
				// select the plane that's the "most perpendicular" to the camera
				switch (this._activeHandle.axis) {
					case 0:
						normal.copy(
							screenY.cross(screenX).length() > screenZ.cross(screenX).length() ?
								worldZ :
								worldY
						);
						break;
					case 1:
						normal.copy(
							screenZ.cross(screenY).length() > screenX.cross(screenY).length() ?
								worldX :
								worldZ
						);
						break;
					case 2:
						normal.copy(
							screenX.cross(screenZ).length() > screenY.cross(screenZ).length() ?
								worldY :
								worldX
						);
						break;
				}

				normal.sub(worldCenter).normalize();

				// Plane constant is world translation projected on normal
				this._plane.constant = worldCenter.dot(normal);
			}
		};
	})();

	Gizmo.prototype._setLine = function () {
		// If translating or scaling along a line, set current line
		this._line.copy([Vector3.UNIT_X, Vector3.UNIT_Y, Vector3.UNIT_Z][this._activeHandle.axis]);
		this._line.applyPostVector(this.transform.matrix);
		this._line.normalize();
	};

	Gizmo.prototype.addRenderable = function (renderable) {
		renderable.originalColor = renderable.materials[0].uniforms.color;
		this.renderables.push(renderable);
	};

	Gizmo.buildMaterialForAxis = function (axis, opacity) {
		var material = new Material(SHADER_DEF, axis + 'Material');
		material.uniforms.color = COLORS[axis].slice();

		if (opacity !== undefined && opacity < 1.0) {
			material.blendState.blending = 'TransparencyBlending';
			material.uniforms.opacity = opacity;
			material.renderQueue = 3000;
		}
		material.cullState.enabled = false;

		return material;
	};

	var COLORS = [
		[1, 0.1, 0.3],
		[0.3, 1, 0.2],
		[0.2, 0.3, 1],
		[0.8, 0.8, 0.8]
	];

	var SHADER_DEF = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexNormal: MeshData.NORMAL
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			color: [1.0, 1.0, 1.0],
			opacity: 1.0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec3 vertexNormal;',

			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec3 normal;',
			'varying vec3 viewPosition;',

			'void main(void) {',
			' vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
			' gl_Position = viewProjectionMatrix * worldPos;',
			' normal = vertexNormal;',
			'}'
		].join('\n'),
		fshader: [
			'varying vec3 normal;',

			'uniform vec3 color;',
			'uniform float opacity;',

			'void main(void)',
			'{',
			' vec3 N = normalize(normal);',
			' vec4 final_color = vec4(color, 1.0);',
			' vec3 light = vec3(1.0, 1.0, 10.0);',
			' float dotProduct = dot(N, normalize(light));',

			' float diffuse = max(dotProduct, 0.0);',
			' final_color.rgb *= (0.5 * diffuse + 0.5);',

			' final_color.a = opacity;',
			' gl_FragColor = final_color;',
			'}'
		].join('\n')
	};

	return Gizmo;
})(goo.ShaderBuilder,goo.MeshData,goo.Shader,goo.Material,goo.Renderer,goo.Transform,goo.Matrix4,goo.Plane,goo.Ray,goo.Vector3,goo.Camera,goo.MathUtils);
goo.TranslationGizmo = (function (
	Gizmo,
	MeshData,
	MeshBuilder,
	Disk,
	Quad,
	Transform,
	Vector3,
	Ray,
	Renderer
) {
	'use strict';

	/**
	 * @extends Gizmo
	 * @hidden
	 */
	function TranslationGizmo() {
		Gizmo.call(this, 'TranslationGizmo');

		this.realTranslation = new Vector3();
		this._snap = false;

		this.compileRenderables();
	}

	TranslationGizmo.prototype = Object.create(Gizmo.prototype);
	TranslationGizmo.prototype.constructor = TranslationGizmo;

	// Triggered when you have mousedown on a gizmo handle
	TranslationGizmo.prototype.activate = function (props) {
		Gizmo.prototype.activate.call(this, props);
		this._setPlane();
		if (this._activeHandle.type === 'Axis') {
			this._setLine();
		}
		this.realTranslation.copy(this.transform.translation);
	};

	TranslationGizmo.prototype.copyTransform = function () {
		Gizmo.prototype.copyTransform.apply(this, arguments);
	};

	function snapToGrid(vector3) {
		vector3.x = Math.round(vector3.x);
		vector3.y = Math.round(vector3.y);
		vector3.z = Math.round(vector3.z);
	}

	TranslationGizmo.prototype.setSnap = function (snap) {
		this._snap = snap;
	};

	(function () {
		var oldRay = new Ray();
		var newRay = new Ray();

		TranslationGizmo.prototype.process = function (mouseState, oldMouseState) {
			Renderer.mainCamera.getPickRay(oldMouseState.x, oldMouseState.y, 1, 1, oldRay);
			Renderer.mainCamera.getPickRay(mouseState.x, mouseState.y, 1, 1, newRay);

			if (this._activeHandle.type === 'Plane') {
				this._moveOnPlane(oldRay, newRay, this._plane);
			} else if (this._activeHandle.type === 'Axis') {
				this._moveOnLine(oldRay, newRay, this._plane, this._line);
			}

			this._postProcess(this.transform.translation);
		};
	})();

	TranslationGizmo.prototype._addTranslation = function (moveVector) {
		this.realTranslation.add(moveVector);
		this.transform.translation.copy(this.realTranslation);

		if (this._snap) {
			snapToGrid(this.transform.translation);
		}
	};

	(function () {
		var oldWorldPos = new Vector3();
		var worldPos = new Vector3();
		var moveVector = new Vector3();

		TranslationGizmo.prototype._moveOnPlane = function (oldRay, newRay, plane) {
			// Project mouse move to plane
			plane.rayIntersect(oldRay, oldWorldPos, true);
			plane.rayIntersect(newRay, worldPos, true);
			moveVector.copy(worldPos).sub(oldWorldPos);

			// And add to translation
			this._addTranslation(moveVector);
		};
	})();

	(function () {
		var oldWorldPos = new Vector3();
		var worldPos = new Vector3();
		var moveVector = new Vector3();

		TranslationGizmo.prototype._moveOnLine = function (oldRay, newRay, plane, line) {
			// Project mousemove to plane
			plane.rayIntersect(oldRay, oldWorldPos, true);
			plane.rayIntersect(newRay, worldPos, true);
			moveVector.copy(worldPos).sub(oldWorldPos);

			// Then project plane diff to line
			var d = moveVector.dot(line);
			moveVector.copy(line).scale(d);

			this._addTranslation(moveVector);
		};
	})();

	TranslationGizmo.prototype.compileRenderables = function () {
		var arrowMesh = buildArrowMesh();
		var quadMesh = new Quad(2, 2);

		buildArrow(arrowMesh, quadMesh, 0).forEach(this.addRenderable, this);
		buildArrow(arrowMesh, quadMesh, 1).forEach(this.addRenderable, this);
		buildArrow(arrowMesh, quadMesh, 2).forEach(this.addRenderable, this);
	};

	function buildArrow(arrowMesh, quadMesh, dim) {
		var arrowTransform = new Transform();
		var quadTransform = new Transform();

		var size = 1.0;
		quadTransform.scale.setDirect(size, size, size);
		if (dim === 2) {
			quadTransform.translation.setDirect(size, size, 0);
		} else if (dim === 0) {
			quadTransform.translation.setDirect(0, size, size);
			quadTransform.setRotationXYZ(0, Math.PI / 2, 0);
			arrowTransform.setRotationXYZ(0, Math.PI / 2, 0);
		} else if (dim === 1) {
			quadTransform.translation.setDirect(size, 0, size);
			quadTransform.setRotationXYZ(Math.PI / 2, 0, 0);
			arrowTransform.setRotationXYZ(Math.PI * 3 / 2, 0, 0);
		}

		return [{
			meshData: arrowMesh,
			materials: [Gizmo.buildMaterialForAxis(dim)],
			transform: arrowTransform,
			id: Gizmo.registerHandle({ type: 'Axis', axis: dim }),
			thickness: 0.6
		}, {
			meshData: quadMesh,
			materials: [Gizmo.buildMaterialForAxis(dim, 0.6)],
			transform: quadTransform,
			id: Gizmo.registerHandle({ type: 'Plane', axis: dim })
		}];
	}

	function buildArrowMesh() {
		var meshBuilder = new MeshBuilder();

		// Arrow head
		var mesh1Data = new Disk(32, 0.6, 2.3);
		// Arrow base
		var mesh2Data = new Disk(32, 0.6);
		// Line
		var mesh3Data = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 2, 2);
		mesh3Data.getAttributeBuffer(MeshData.POSITION).set([0, 0, 0, 0, 0, 7]);
		mesh3Data.getIndexBuffer().set([0, 1]);
		mesh3Data.indexLengths = null;
		mesh3Data.indexModes = ['Lines'];

		// Arrow head
		var transform = new Transform();
		transform.translation.setDirect(0, 0, 7);
		transform.update();
		meshBuilder.addMeshData(mesh1Data, transform);

		// Arrow base
		transform.setRotationXYZ(0, Math.PI, 0);
		transform.update();
		meshBuilder.addMeshData(mesh2Data, transform);

		// Line
		var transform = new Transform();
		transform.update();
		meshBuilder.addMeshData(mesh3Data, transform);

		// Combine
		var mergedMeshData = meshBuilder.build()[0];
		return mergedMeshData;
	}

	return TranslationGizmo;
})(goo.Gizmo,goo.MeshData,goo.MeshBuilder,goo.Disk,goo.Quad,goo.Transform,goo.Vector3,goo.Ray,goo.Renderer);
goo.GlobalTranslationGizmo = (function (
	Gizmo,
	Vector3,
	TranslationGizmo
) {
	'use strict';

	/**
	 * @extends Gizmo
	 * @hidden
	 */
	function GlobalTranslationGizmo() {
		Gizmo.call(this, 'GlobalTranslationGizmo');

		this.realTranslation = new Vector3();
		this._snap = false;

		this.compileRenderables();
	}

	GlobalTranslationGizmo.prototype = Object.create(Gizmo.prototype);
	GlobalTranslationGizmo.prototype.constructor = GlobalTranslationGizmo;

	GlobalTranslationGizmo.prototype.activate = TranslationGizmo.prototype.activate;
	GlobalTranslationGizmo.prototype.process = TranslationGizmo.prototype.process;

	GlobalTranslationGizmo.prototype.copyTransform = function (transform) {
		Gizmo.prototype.copyTransform.call(this, transform);

		this.transform.rotation.setIdentity();
		this.updateTransforms();
	};

	GlobalTranslationGizmo.prototype.setSnap = TranslationGizmo.prototype.setSnap;

	GlobalTranslationGizmo.prototype._addTranslation = TranslationGizmo.prototype._addTranslation;

	GlobalTranslationGizmo.prototype._moveOnPlane = TranslationGizmo.prototype._moveOnPlane;
	GlobalTranslationGizmo.prototype._moveOnLine = TranslationGizmo.prototype._moveOnLine;

	GlobalTranslationGizmo.prototype.compileRenderables = TranslationGizmo.prototype.compileRenderables;

	return GlobalTranslationGizmo;
})(goo.Gizmo,goo.Vector3,goo.TranslationGizmo);
goo.RotationGizmo = (function (
	Gizmo,
	Sphere,
	Torus,
	Vector3,
	Matrix3,
	Transform,
	Renderer,
	Ray,
	MathUtils
) {
	'use strict';

	/**
	 * @extends Gizmo
	 * @hidden
	 */
	function RotationGizmo() {
		Gizmo.call(this, 'RotationGizmo');

		this._rotation = new Matrix3();
		this._direction = new Vector3();

		//TODO: create a function that does this sort of thing
		this.snap = false;
		this._accumulatedRotation = new Vector3();
		this._oldAngle = new Vector3();

		this.compileRenderables();
	}

	RotationGizmo.prototype = Object.create(Gizmo.prototype);
	RotationGizmo.prototype.constructor = RotationGizmo;

	var ROTATION_SCALE = 4;

	(function () {
		var worldCenter = new Vector3();
		var pickedPoint = new Vector3();
		var rotationDirection = new Vector3();
		var axis = new Vector3();
		var ray = new Ray();
		var crossResult = new Vector3();

		RotationGizmo.prototype.activate = function (props) {
			Gizmo.prototype.activate.call(this, props);

			if (this._activeHandle.axis < 3) {
				// Get rotation axis
				axis.copy([Vector3.UNIT_X, Vector3.UNIT_Y, Vector3.UNIT_Z][this._activeHandle.axis]);
				axis.applyPost(this.transform.rotation);

				// Get rotation center
				worldCenter.copy(Vector3.ZERO);
				worldCenter.applyPostPoint(this.transform.matrix);

				// Get picked point in world space (sort of)
				Renderer.mainCamera.getPickRay(
					props.x,
					props.y,
					1,
					1,
					ray
				);
				pickedPoint.copy(ray.origin).sub(worldCenter);
				var d = pickedPoint.length() * 0.9;
				pickedPoint.copy(ray.direction).scale(d).add(ray.origin);

				// Get vector from center to picked point, cross it with rotation axis and get drag direction
				rotationDirection.copy(pickedPoint).sub(worldCenter);

				crossResult.copy(axis).cross(rotationDirection);
				rotationDirection.copy(crossResult);

				rotationDirection.add(pickedPoint);
				Renderer.mainCamera.getScreenCoordinates(
					rotationDirection,
					1,
					1,
					this._direction
				);
				this._direction.subDirect(props.x, props.y, 0);

				this._direction.z = 0;
				this._direction.normalize();
			}
		};
	})();

	RotationGizmo.prototype.process = function (mouseState, oldMouseState) {
		var delta = mouseState.clone().sub(oldMouseState);

		if (this._activeHandle.axis === 3) {
			this._rotateOnScreen(delta);
		} else {
			this._rotateOnAxis(delta);
		}

		this._postProcess(this.transform.rotation);
	};

	(function () {
		var camRotation = new Matrix3();
		var screenRotation = new Matrix3();

		RotationGizmo.prototype._rotateOnScreen = function (delta) {
			this._rotation.setIdentity();

			this._rotation.rotateY(delta.x * ROTATION_SCALE);
			this._rotation.rotateX(delta.y * ROTATION_SCALE);

			var camMat = Renderer.mainCamera.getViewMatrix();

			// there has to be a function for this
			camRotation.copyMatrix4(camMat);
			screenRotation.set(camRotation).invert();
			screenRotation.mul(this._rotation);
			screenRotation.mul(camRotation);

			this.transform.rotation.mul2(
				screenRotation,
				this.transform.rotation
			);
		};
	})();

	// --- functions for snapping to certain angles
	function inclinedType2 (size, t) {
		return function (x) {
			var z = x % size;
			z += z < 0 ? size : 0;
			if (z < t) {
				return x - z;
			} else if (z > size - t) {
				return x + size - z;
			}
			return x;
		};
	}

	var snapFunction = inclinedType2(Math.PI / 4, Math.PI / 16);
	var identityFunction = function (x) { return x; };
	// ---

	RotationGizmo.prototype._applyRotation = function () {
		this.transform.rotation.mul2(
			this.transform.rotation,
			this._rotation
		);
	};

	RotationGizmo.prototype._rotateOnAxis = function (delta) {
		this._rotation.setIdentity();

		var sum = (delta.x * this._direction.x) + (delta.y * this._direction.y);
		sum *= ROTATION_SCALE;

		var transformFunction = this._snap ? snapFunction : identityFunction;
		var newAngle;

		switch (this._activeHandle.axis) {
			case 0:
				this._accumulatedRotation.x += sum;
				newAngle = transformFunction(this._accumulatedRotation.x);
				this._rotation.rotateX(newAngle - this._oldAngle.x);
				this._oldAngle.x = newAngle;
				break;
			case 1:
				this._accumulatedRotation.y += sum;
				newAngle = transformFunction(this._accumulatedRotation.y);
				this._rotation.rotateY(newAngle - this._oldAngle.y);
				this._oldAngle.y = newAngle;
				break;
			case 2:
				this._accumulatedRotation.z += sum;
				newAngle = transformFunction(this._accumulatedRotation.z);
				this._rotation.rotateZ(newAngle - this._oldAngle.z);
				this._oldAngle.z = newAngle;
				break;
		}

		this._applyRotation();
	};

	RotationGizmo.prototype.compileRenderables = function () {
		var ballMesh = new Sphere(32, 32, 1.1);
		var torusMesh = new Torus(64, 8, 0.1, 2.5);

		this.addRenderable(buildBall(ballMesh));
		this.addRenderable(buildTorus(torusMesh, 0));
		this.addRenderable(buildTorus(torusMesh, 1));
		this.addRenderable(buildTorus(torusMesh, 2));
	};

	function buildBall(ballMesh) {
		var transform = new Transform();
		transform.scale.setDirect(1.2, 1.2, 1.2);

		return {
			meshData: ballMesh,
			materials: [Gizmo.buildMaterialForAxis(3, 0.6)],
			transform: new Transform(),
			id: Gizmo.registerHandle({ type: 'Rotate', axis: 3 })
		};
	}

	function buildTorus(torusMesh, dim) {
		var transform = new Transform();
		transform.scale.setDirect(1.7, 1.7, 1.7);
		if (dim === 0) {
			transform.setRotationXYZ(0, MathUtils.HALF_PI, 0);
		} else if (dim === 1) {
			transform.setRotationXYZ(MathUtils.HALF_PI, 0, 0);
		}

		return {
			meshData: torusMesh,
			materials: [Gizmo.buildMaterialForAxis(dim)],
			transform: transform,
			id: Gizmo.registerHandle({ type: 'Rotate', axis: dim }),
			thickness: 0.35
		};
	}

	return RotationGizmo;
})(goo.Gizmo,goo.Sphere,goo.Torus,goo.Vector3,goo.Matrix3,goo.Transform,goo.Renderer,goo.Ray,goo.MathUtils);
goo.GlobalRotationGizmo = (function (
	Gizmo,
	RotationGizmo,
	Sphere,
	Torus,
	Vector3,
	Matrix3,
	Matrix4,
	Transform,
	Renderer,
	Ray
) {
	'use strict';

	/**
	 * @extends Gizmo
	 * @hidden
	 */
	function GlobalRotationGizmo() {
		Gizmo.call(this, 'GlobalRotationGizmo');

		this._rotation = new Matrix3();
		this._direction = new Vector3();

		//TODO: create a function that does this sort of thing
		this.snap = false;
		this._accumulatedRotation = new Vector3();
		this._oldAngle = new Vector3();

		this.compileRenderables();
	}

	GlobalRotationGizmo.prototype = Object.create(Gizmo.prototype);
	GlobalRotationGizmo.prototype.constructor = GlobalRotationGizmo;

	(function () {
		var worldCenter = new Vector3();
		var pickedPoint = new Vector3();
		var rotationDirection = new Vector3();
		var axis = new Vector3();
		var ray = new Ray();
		var crossResult = new Vector3();

		GlobalRotationGizmo.prototype.activate = function (props) {
			Gizmo.prototype.activate.call(this, props);

			if (this._activeHandle.axis < 3) {
				// Get rotation axis
				axis.copy([Vector3.UNIT_X, Vector3.UNIT_Y, Vector3.UNIT_Z][this._activeHandle.axis]);

				// Get rotation center
				worldCenter.copy(Vector3.ZERO);
				worldCenter.applyPostPoint(this.transform.matrix);

				// Get picked point in world space (sort of)
				Renderer.mainCamera.getPickRay(
					props.x,
					props.y,
					1,
					1,
					ray
				);
				pickedPoint.copy(ray.origin).sub(worldCenter);
				var d = pickedPoint.length() * 0.9;
				pickedPoint.copy(ray.direction).scale(d).add(ray.origin);

				// Get vector from center to picked point, cross it with rotation axis and get drag direction
				rotationDirection.copy(pickedPoint).sub(worldCenter);

				crossResult.copy(axis).cross(rotationDirection);
				rotationDirection.copy(crossResult);

				rotationDirection.add(pickedPoint);
				Renderer.mainCamera.getScreenCoordinates(
					rotationDirection,
					1,
					1,
					this._direction
				);
				this._direction.subDirect(props.x, props.y, 0);

				this._direction.z = 0;
				this._direction.normalize();
			}
		};
	})();

	GlobalRotationGizmo.prototype.process = RotationGizmo.prototype.process;

	GlobalRotationGizmo.prototype._rotateOnScreen = RotationGizmo.prototype._rotateOnScreen;

	GlobalRotationGizmo.prototype._applyRotation = function () {
		this.transform.rotation.mul2(
			this._rotation,
			this.transform.rotation
		);
	};

	GlobalRotationGizmo.prototype._rotateOnAxis = RotationGizmo.prototype._rotateOnAxis;

	(function () {
		var transform = new Transform();

		/**
		 * Update the transform of the provided renderable.
		 * @param renderable
		 */
		GlobalRotationGizmo.prototype.updateRenderableTransform = function (renderable) {
			transform.copy(this.transform);
			transform.rotation.setIdentity();
			transform.update();

			renderable.transform.matrix.mul2(
				transform.matrix,
				renderable.transform.matrix
			);
		};
	})();

	GlobalRotationGizmo.prototype.compileRenderables = RotationGizmo.prototype.compileRenderables;

	return GlobalRotationGizmo;
})(goo.Gizmo,goo.RotationGizmo,goo.Sphere,goo.Torus,goo.Vector3,goo.Matrix3,goo.Matrix4,goo.Transform,goo.Renderer,goo.Ray);
goo.ScaleGizmo = (function (
	Gizmo,
	MeshData,
	MeshBuilder,
	Box,
	Transform,
	Renderer,
	Vector3,
	Ray,
	MathUtils
) {
	'use strict';

	/**
	 * @extends Gizmo
	 * @hidden
	 */
	function ScaleGizmo(gizmoRenderSystem) {
		Gizmo.call(this, 'ScaleGizmo', gizmoRenderSystem);

		this._transformScale = new Vector3(1, 1, 1);

		this.compileRenderables();
	}

	ScaleGizmo.prototype = Object.create(Gizmo.prototype);
	ScaleGizmo.prototype.constructor = ScaleGizmo;

	var SCALE = 1;

	ScaleGizmo.prototype.activate = function (props) {
		Gizmo.prototype.activate.call(this, props);
		if (this._activeHandle.axis !== 3) {
			this._setPlane();
			this._setLine();
		}
	};

	ScaleGizmo.prototype.copyTransform = function (transform) {
		Gizmo.prototype.copyTransform.call(this, transform);
		this._transformScale.copy(transform.scale);
	};

	ScaleGizmo.prototype.process = function (mouseState, oldMouseState) {
		if (this._activeHandle.axis === 3) {
			this._scaleUniform(mouseState, oldMouseState);
		} else {
			this._scaleNonUniform(mouseState, oldMouseState);
		}

		this._postProcess(this._transformScale);
	};

	ScaleGizmo.prototype._scaleUniform = function (mouseState, oldMouseState) {
		var scale = Math.pow(
			1 + mouseState.x + oldMouseState.y - oldMouseState.x - mouseState.y,
			SCALE
		);

		var cameraEntityDistance = Renderer.mainCamera.translation.distance(this.transform.translation);
		scale += cameraEntityDistance / 200000 * MathUtils.sign(scale - 1);

		this._transformScale.scale(scale);
	};

	(function () {
		var oldRay = new Ray();
		var newRay = new Ray();

		var oldWorldPos = new Vector3();
		var worldPos = new Vector3();
		var result = new Vector3();

		var AXIS_FOR_ID = ['x', 'y', 'z'];

		ScaleGizmo.prototype._scaleNonUniform = function (mouseState, oldMouseState) {
			Renderer.mainCamera.getPickRay(oldMouseState.x, oldMouseState.y, 1, 1, oldRay);
			Renderer.mainCamera.getPickRay(mouseState.x, mouseState.y, 1, 1, newRay);

			// Project mousemove to plane
			this._plane.rayIntersect(oldRay, oldWorldPos);
			this._plane.rayIntersect(newRay, worldPos);

			result.copy(worldPos).sub(oldWorldPos);
			result.div(this.transform.scale).scale(0.07);

			// Then project plane diff to line
			var d = result.dot(this._line);
			var scale = Math.pow(1 + d, SCALE);

			this._transformScale[AXIS_FOR_ID[this._activeHandle.axis]] *= scale;
		};
	})();

	ScaleGizmo.prototype.compileRenderables = function () {
		var boxMesh = new Box(1.4, 1.4, 1.4);
		var arrowMesh = buildArrowMesh();

		this.addRenderable(buildBox(boxMesh));
		this.addRenderable(buildArrow(arrowMesh, 0));
		this.addRenderable(buildArrow(arrowMesh, 1));
		this.addRenderable(buildArrow(arrowMesh, 2));
	};

	function buildBox(boxMesh) {
		return {
			meshData: boxMesh,
			materials: [Gizmo.buildMaterialForAxis(3)],
			transform: new Transform(),
			id: Gizmo.registerHandle({ type: 'Scale', axis: 3 })
		};
	}

	function buildArrow(arrowMesh, dim) {
		var transform = new Transform();

		if (dim === 0) {
			transform.setRotationXYZ(0, Math.PI / 2, 0);
		} else if (dim === 1) {
			transform.setRotationXYZ(Math.PI * 3 / 2, 0, 0);
		}

		return {
			meshData: arrowMesh,
			materials: [Gizmo.buildMaterialForAxis(dim)],
			transform: transform,
			id: Gizmo.registerHandle({ type: 'Scale', axis: dim })
		};
	}

	function buildArrowMesh() {
		var meshBuilder = new MeshBuilder();

		// Box
		var mesh1Data = new Box();

		// Line
		var mesh2Data = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 2, 2);
		mesh2Data.getAttributeBuffer(MeshData.POSITION).set([0, 0, 0, 0, 0, 1]);
		mesh2Data.getIndexBuffer().set([0, 1]);
		mesh2Data.indexLengths = null;
		mesh2Data.indexModes = ['Lines'];

		// Box
		var transform = new Transform();
		transform.translation.setDirect(0, 0, 8);
		transform.update();
		meshBuilder.addMeshData(mesh1Data, transform);

		// Line
		var transform = new Transform();
		transform.scale.setDirect(1, 1, 8);
		transform.update();
		meshBuilder.addMeshData(mesh2Data, transform);

		// Combine
		var mergedMeshData = meshBuilder.build()[0];

		return mergedMeshData;
	}

	return ScaleGizmo;
})(goo.Gizmo,goo.MeshData,goo.MeshBuilder,goo.Box,goo.Transform,goo.Renderer,goo.Vector3,goo.Ray,goo.MathUtils);
goo.GizmoRenderSystem = (function (
	System,
	SystemBus,
	SimplePartitioner,
	Material,
	ShaderLib,
	ShaderFragment,
	Matrix3,
	Matrix4,
	Vector2,
	MeshData,
	Shader,
	Gizmo,
	TranslationGizmo,
	GlobalTranslationGizmo,
	RotationGizmo,
	GlobalRotationGizmo,
	ScaleGizmo
) {
	'use strict';

	/**
	 * Renders transform gizmos<br>
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/util/TransformGizmos/TransformGizmos-vtest.html Working example
	 * @property {boolean} doRender Only render if set to true
	 * @extends System
	 */
	function GizmoRenderSystem(callbacks) {
		System.call(this, 'GizmoRenderSystem', null);

		this.renderables = [];
		this.camera = null;

		this.gizmos = [
			new TranslationGizmo(),
			new GlobalTranslationGizmo(),
			new RotationGizmo(),
			new GlobalRotationGizmo(),
			new ScaleGizmo()
		];

		this.active = false;
		this.nextGizmo = null;
		this.setupCallbacks(callbacks);

		this.activeGizmo = null;
		this.viewportWidth = 0;
		this.viewportHeight = 0;
		this.domElement = null;

		this.pickingMaterial = Material.createEmptyMaterial(customPickingShader, 'pickingMaterial');
		this.pickingMaterial.blendState = {
			blending: 'NoBlending',
			blendEquation: 'AddEquation',
			blendSrc: 'SrcAlphaFactor',
			blendDst: 'OneMinusSrcAlphaFactor'
		};

		this._devicePixelRatio = 1;

		this._mouseState = new Vector2();
		this._oldMouseState = new Vector2();

		this._dirty = false;

		this._mouseMove = function (evt) {
			if (!this.activeGizmo) { return; }

			var x = (evt.offsetX !== undefined) ? evt.offsetX : evt.layerX;
			var y = (evt.offsetY !== undefined) ? evt.offsetY : evt.layerY;

			this._mouseState.setDirect(
				x / (this.viewportWidth / this._devicePixelRatio),
				y / (this.viewportHeight / this._devicePixelRatio)
			);

			this._dirty = true;
		}.bind(this);

		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			this.camera = newCam.camera;
		}.bind(this));
	}

	GizmoRenderSystem.prototype = Object.create(System.prototype);
	GizmoRenderSystem.prototype.constructor = GizmoRenderSystem;

	GizmoRenderSystem.prototype.activate = function (id, x, y) {
		this.active = true;
		var handle = Gizmo.getHandle(id);
		if (handle && this.activeGizmo) {
			this._oldMouseState.setDirect(
				x / (this.viewportWidth / this._devicePixelRatio),
				y / (this.viewportHeight / this._devicePixelRatio)
			);

			this.activeGizmo.activate({
				id: id,
				data: handle,
				x: x / (this.viewportWidth / this._devicePixelRatio),
				y: y / (this.viewportHeight / this._devicePixelRatio)
			});

			this.domElement.addEventListener('mousemove', this._mouseMove);
		}
	};

	GizmoRenderSystem.prototype.deactivate = function () {
		this.activeGizmo.deactivate();

		this.active = false;
		this.domElement.removeEventListener('mousemove', this._mouseMove);
		if (this.nextGizmo !== null) {
			this.setActiveGizmo(this.nextGizmo);
			this.nextGizmo = null;
		}
	};

	GizmoRenderSystem.prototype.getGizmo = function (id) {
		return this.gizmos[id];
	};

	GizmoRenderSystem.prototype.show = function (entity) {
		this.entity = entity;
		if (this.activeGizmo) {
			if (this.entity) {
				this.showGizmo(this.activeGizmo);
			} else {
				this.hideGizmo(this.activeGizmo);
			}
		}
	};

	GizmoRenderSystem.prototype.showGizmo = function (gizmo) {
		gizmo.copyTransform(this.entity.transformComponent.worldTransform);
		if (!gizmo.visible) {
			this.renderables = gizmo.renderables;
			gizmo.visible = true;
		}
	};

	GizmoRenderSystem.prototype.hideGizmo = function (gizmo) {
		if (gizmo.visible) {
			this.renderables = [];
			gizmo.visible = false;
		}
	};

	GizmoRenderSystem.prototype.setActiveGizmo = function (id) {
		if (this.active) {
			this.nextGizmo = id;
			return;
		}
		if (this.activeGizmo) {
			this.hideGizmo(this.activeGizmo);
		}
		this.activeGizmo = this.gizmos[id] || null;
		if (this.activeGizmo && this.entity) {
			this.showGizmo(this.activeGizmo);
		}
	};

	GizmoRenderSystem.prototype.setSnap = function (state) {
		if (!this.activeGizmo) { return; }

		this.activeGizmo.setSnap(state);
	};

	GizmoRenderSystem.prototype.setupCallbacks = function (callbacks) {
		if (callbacks && callbacks.length === 5) {
			this.gizmos[0].onChange = callbacks[0];
			this.gizmos[1].onChange = callbacks[1];
			this.gizmos[2].onChange = callbacks[2];
			this.gizmos[3].onChange = callbacks[3];
			this.gizmos[4].onChange = callbacks[4];
			return;
		}

		var inverseRotation = new Matrix3();
		var inverseTransformation = new Matrix4();


		var onTranslationChange = function (change) {
			if (!this.entity) { return; }

			var translation = this.entity.transformComponent.transform.translation;
			translation.copy(change);

			if (this.entity.transformComponent.parent) {
				inverseTransformation.copy(this.entity.transformComponent.parent.worldTransform.matrix);
				inverseTransformation.invert();
				translation.applyPostPoint(inverseTransformation);
			}

			this.entity.transformComponent.setUpdated();
		}.bind(this);

		this.gizmos[0].onChange = onTranslationChange;

		this.gizmos[1].onChange = onTranslationChange;


		var onRotationChange = function (change) {
			if (!this.entity) { return; }

			this.entity.transformComponent.transform.rotation.copy(change);

			if (this.entity.transformComponent.parent) {
				inverseRotation.copy(this.entity.transformComponent.parent.worldTransform.rotation);
				inverseRotation.invert();
				this.entity.transformComponent.transform.rotation.mul(inverseRotation);
			}

			this.entity.transformComponent.setUpdated();
		}.bind(this);

		// Set bound entities rotation
		this.gizmos[2].onChange = onRotationChange;

		this.gizmos[3].onChange = onRotationChange;


		// Set bound entities scale
		this.gizmos[4].onChange = function (change) {
			if (!this.entity) { return; }

			var scale = this.entity.transformComponent.transform.scale;

			scale.copy(change);

			if (this.entity.transformComponent.parent) {
				scale.div(this.entity.transformComponent.parent.worldTransform.scale);
			}

			this.entity.transformComponent.setUpdated();
		}.bind(this);
	};

	GizmoRenderSystem.prototype.inserted = function (/*entity*/) {};

	GizmoRenderSystem.prototype.deleted = function (/*entity*/) {};

	GizmoRenderSystem.prototype.process = function (/*entities, tpf*/) {
		if (!this.activeGizmo) { return; }

		if (this._dirty) {
			this.activeGizmo.process(this._mouseState, this._oldMouseState);
			this._oldMouseState.copy(this._mouseState);
			this._dirty = false;
		}

		this.activeGizmo.updateTransforms();
	};

	GizmoRenderSystem.prototype.render = function (renderer) {
		renderer.checkResize(this.camera);
		this._devicePixelRatio = renderer._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / renderer.svg.currentScale : 1;

		if (!this.domElement) {
			this.domElement = renderer.domElement;
		}
		this.viewportHeight = renderer.viewportHeight;
		this.viewportWidth = renderer.viewportWidth;

		if (this.camera) {
			renderer.render(this.renderables, this.camera, this.lights, null, { color: false, stencil: true, depth: true }, this.overrideMaterials);
		}
	};

	GizmoRenderSystem.prototype.invalidateHandles = function (renderer) {
		renderer.invalidateMaterial(this.pickingMaterial);

		this.gizmos.forEach(function (gizmo) {
			gizmo.renderables.forEach(function (renderable) {
				renderable.materials.forEach(function (material) {
					renderer.invalidateMaterial(material);
				});

				renderer.invalidateMeshData(renderable.meshData);
			});
		});
	};

	GizmoRenderSystem.prototype.renderToPick = function (renderer, skipUpdateBuffer) {
		for (var i = 0; i < this.renderables.length; i++) {
			var renderable = this.renderables[i];
			if (renderable.thickness !== undefined) {
				renderable.materials[0].uniforms.thickness = renderable.thickness;
			}
		}
		renderer.renderToPick(this.renderables, this.camera, { color: false, stencil: true, depth: true }, skipUpdateBuffer, undefined, undefined, undefined, this.pickingMaterial);
		for (var i = 0; i < this.renderables.length; i++) {
			var renderable = this.renderables[i];
			if (renderable.thickness) {
				renderable.materials[0].uniforms.thickness = 0;
			}
		}
	};

	var customPickingShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexNormal: MeshData.NORMAL
		},
		processors: [
			function (shader, shaderInfo) {
				var attributeMap = shaderInfo.meshData.attributeMap;

				shader.defines = shader.defines || {};

				for (var attribute in attributeMap) {
					shader.setDefine(attribute, true);
				}
			}
		],
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraFar: Shader.FAR_PLANE,
			thickness: 0.0,
			id: function (shaderInfo) {
				return shaderInfo.renderable.id + 1;
			}
		},
		vshader: [
		'attribute vec3 vertexPosition;',
		'#ifdef NORMAL',
			'attribute vec3 vertexNormal;',
		'#endif',

		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',
		'uniform float cameraFar;',
		'uniform float thickness;',

		'varying float depth;',

		'void main() {',
			'#ifdef NORMAL',
				'vec4 mvPosition = viewMatrix * worldMatrix * vec4( vertexPosition + vertexNormal * thickness, 1.0 );',
			'#else',
				'vec4 mvPosition = viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );',
			'#endif',

			'depth = length(mvPosition.xyz) / cameraFar;',
			'gl_Position = projectionMatrix * mvPosition;',
		'}'
		].join('\n'),
		fshader: [
		'uniform float id;',

		'varying float depth;',

		ShaderFragment.methods.packDepth16,

		'void main() {',
			'vec2 packedId = vec2(floor(id/255.0), mod(id, 255.0)) * vec2(1.0/255.0);',
			'vec2 packedDepth = packDepth16(depth);',
			'gl_FragColor = vec4(packedId, packedDepth);',
		'}'
		].join('\n')
	};

	return GizmoRenderSystem;
})(goo.System,goo.SystemBus,goo.SimplePartitioner,goo.Material,goo.ShaderLib,goo.ShaderFragment,goo.Matrix3,goo.Matrix4,goo.Vector2,goo.MeshData,goo.Shader,goo.Gizmo,goo.TranslationGizmo,goo.GlobalTranslationGizmo,goo.RotationGizmo,goo.GlobalRotationGizmo,goo.ScaleGizmo);
if (typeof require === "function") {
define("goo/util/gizmopack/Gizmo", [], function () { return goo.Gizmo; });
define("goo/util/gizmopack/TranslationGizmo", [], function () { return goo.TranslationGizmo; });
define("goo/util/gizmopack/GlobalTranslationGizmo", [], function () { return goo.GlobalTranslationGizmo; });
define("goo/util/gizmopack/RotationGizmo", [], function () { return goo.RotationGizmo; });
define("goo/util/gizmopack/GlobalRotationGizmo", [], function () { return goo.GlobalRotationGizmo; });
define("goo/util/gizmopack/ScaleGizmo", [], function () { return goo.ScaleGizmo; });
define("goo/util/gizmopack/GizmoRenderSystem", [], function () { return goo.GizmoRenderSystem; });
}
