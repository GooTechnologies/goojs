define([
	'goo/renderer/shaders/ShaderBuilder',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Material',
	'goo/renderer/Renderer',
	'goo/math/Transform',
	'goo/math/Matrix4x4',
	'goo/math/Plane',
	'goo/math/Ray',
	'goo/math/Vector3',
	'goo/renderer/Camera',
	'goo/math/MathUtils'
], function (
	ShaderBuilder,
	MeshData,
	Shader,
	Material,
	Renderer,
	Transform,
	Matrix4x4,
	Plane,
	Ray,
	Vector3,
	Camera,
	MathUtils
) {
	'use strict';

	/**
	* 	*/
	function Gizmo(name, gizmoRenderSystem) {
		this.name = name || 'Default Gizmo';
		this.gizmoRenderSystem = gizmoRenderSystem;
		this._colors = [
			[1, 0.1, 0.3],
			[0.2, 1, 0.3],
			[0.2, 0.3, 1],
			[0.8, 0.8, 0.8]
		];
		this._gizmoSize = 1 / 60;

		this._plane = new Plane();
		this._line = new Vector3();
		this._activeHandle = null;
		this._mouse = {
			position: [0,0],
			oldPosition: [0,0]
		};
		this.dirty = false;
		this.visible = false;

		this.transform = new Transform();
		this.renderables = [];
		this.onChange = null;

		// Calculation helpers
		this._oldRay = new Ray();
		this._newRay = new Ray();
		this._result = new Vector3();
		this._v0 = new Vector3();
		this._v1 = new Vector3();
		this._v2 = new Vector3();
		this._v3 = new Vector3();
		this._s0 = new Vector3();
		this._s1 = new Vector3();
		this._s2 = new Vector3();
		this._s3 = new Vector3();
	}

	Gizmo.handleStore = [];
	Gizmo.registerHandle = function(handle) {
		var retVal = Gizmo.handleStore.length + 16000;
		Gizmo.handleStore.push(handle);
		return retVal;
	};
	Gizmo.getHandle = function(id) {
		if(id < 16000) {
			return null;
		}
		return Gizmo.handleStore[id - 16000];
	};

	Gizmo.prototype.getRenderable = function(id) {
		for (var i = 0; i < this.renderables.length; i++) {
			var renderable = this.renderables[i];
			if (renderable.id === id) {
				return renderable;
			}
		}
	};

	Gizmo.prototype.activate = function(properties) {
		this._activeHandle = properties.data;
		this._mouse.oldPosition[0] = properties.x;
		this._mouse.oldPosition[1] = properties.y;

		this._activeRenderable = this.getRenderable(properties.id);

		this._activeRenderable.materials[0].uniforms.color = [1, 1, 0];
	};

	Gizmo.prototype.deactivate = function() {
		if (this._activeRenderable) {
			var originalColor = this._activeRenderable.originalColor;
			this._activeRenderable.materials[0].uniforms.color = [originalColor[0], originalColor[1], originalColor[2]];
		}
	};

	Gizmo.prototype.copyTransform = function(transform) {
		this.transform.setIdentity();
		if(transform) {
			transform.matrix.getTranslation(this.transform.translation);
			this.transform.rotation.copy(transform.rotation);
			this.updateTransforms();
		}
	};

	Gizmo.prototype.update = function(mousePos) {
		this._mouse.position[0] = mousePos[0];
		this._mouse.position[1] = mousePos[1];
		this.dirty = true;
	};


	Gizmo.prototype.updateTransforms = function() {
		if (Renderer.mainCamera) {
			var camera = Renderer.mainCamera;
			var scale;
			if (camera.projectionMode === Camera.Perspective) {
				var dist = camera.translation.distance(this.transform.translation);
				scale = dist * this._gizmoSize;
				scale *= Math.tan(camera.fov * MathUtils.DEG_TO_RAD / 2) * 2;
			} else {
				scale = (camera._frustumTop - camera._frustumBottom) / 30;
			}
			this.transform.scale.setDirect(scale, scale, scale);
		}

		this.transform.update();
		for (var i = this.renderables.length - 1; i >= 0; i--) {
			this.renderables[i].transform.update();
			this.renderables[i].transform.matrix.mul2(
				this.transform.matrix,
				this.renderables[i].transform.matrix
			);
		}
	};

	Gizmo.prototype._setPlane = function() {
		var normal = this._plane.normal,
			worldCenter = this._v0,
			worldX = this._v1,
			worldY = this._v2,
			worldZ = this._v3,
			screenCenter = this._s0,
			screenX = this._s1,
			screenY = this._s2,
			screenZ = this._s3;

		if(this._activeHandle.type === 'Plane') {
			// Calculate plane's normal in world space
			normal.set([Vector3.UNIT_X, Vector3.UNIT_Y, Vector3.UNIT_Z][this._activeHandle.axis]);
			this.transform.matrix.applyPostVector(normal);
			normal.normalize();

			// Set plane distance from world origin by projecting world translation to plane normal
			worldCenter.set(Vector3.ZERO);
			this.transform.matrix.applyPostPoint(worldCenter);
			this._plane.constant = worldCenter.dot(normal);
		} else {
			// Get gizmo handle points in world space
			worldCenter.set(Vector3.ZERO);
			this.transform.matrix.applyPostPoint(worldCenter);
			worldX.set(Vector3.UNIT_X);
			this.transform.matrix.applyPostPoint(worldX);
			worldY.set(Vector3.UNIT_Y);
			this.transform.matrix.applyPostPoint(worldY);
			worldZ.set(Vector3.UNIT_Z);
			this.transform.matrix.applyPostPoint(worldZ);

			// Gizmo handle points in screen space
			Renderer.mainCamera.getScreenCoordinates(worldCenter, 1, 1, screenCenter);
			Renderer.mainCamera.getScreenCoordinates(worldX, 1, 1, screenX);
			screenX.sub(screenCenter);
			Renderer.mainCamera.getScreenCoordinates(worldY, 1, 1, screenY);
			screenY.sub(screenCenter);
			Renderer.mainCamera.getScreenCoordinates(worldZ, 1, 1, screenZ);
			screenZ.sub(screenCenter);
			// Set plane to active axis's adjacent plane with the biggest screen area
			if(this._activeHandle.axis === 0) {
				if(screenY.cross(screenX).length() > screenZ.cross(screenX).length()) {
					normal.set(worldZ).sub(worldCenter).normalize();
				} else {
					normal.set(worldY).sub(worldCenter).normalize();
				}
			} else if (this._activeHandle.axis === 1) {
				if(screenZ.cross(screenY).length() > screenX.cross(screenY).length()) {
					normal.set(worldX).sub(worldCenter).normalize();
				} else {
					normal.set(worldZ).sub(worldCenter).normalize();
				}
			} else {
				if(screenX.cross(screenZ).length() > screenY.cross(screenZ).length()) {
					normal.set(worldY).sub(worldCenter).normalize();
				} else {
					normal.set(worldX).sub(worldCenter).normalize();
				}
			}
			// Plane constant is world translation projected on normal
			this._plane.constant = worldCenter.dot(normal);
		}
	};

	Gizmo.prototype._setLine = function() {
		// If translating or scaling along a line, set current line
		this._line.set([Vector3.UNIT_X, Vector3.UNIT_Y, Vector3.UNIT_Z][this._activeHandle.axis]);
		this.transform.matrix.applyPostVector(this._line);
		this._line.normalize();
	};

	Gizmo.prototype.addRenderable = function(renderable) {
		renderable.originalColor = renderable.materials[0].uniforms.color;
		this.renderables.push(renderable);
	};

	Gizmo.prototype._buildMaterialForAxis = function(axis, opacity) {
		var material = new Material(Gizmo._shaderDef, axis + 'Material');
		material.uniforms.color = this._colors[axis];

		if(opacity !== undefined && opacity < 1.0) {
			// material.depthState.write = true;
			// material.depthState.enabled = false;
			material.blendState.blending = 'CustomBlending';
			material.uniforms.opacity = opacity;
			material.renderQueue = 3000;
		}
		material.cullState.enabled = false;

		return material;
	};

	Gizmo._shaderDef = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexNormal : MeshData.NORMAL
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			cameraPosition : Shader.CAMERA,
			color : [1.0, 1.0, 1.0],
			opacity: 1.0,
			light: [-20,20,20]
		},
		vshader : [
			'attribute vec3 vertexPosition;',
			'attribute vec3 vertexNormal;',

			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform vec3 cameraPosition;',

			'varying vec3 normal;',
			'varying vec3 viewPosition;',

			'void main(void) {',
			'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
			'	gl_Position = viewProjectionMatrix * worldPos;',
			'	normal = vertexNormal;',
			'	viewPosition = cameraPosition - worldPos.xyz;',
			'}'//
		].join('\n'),
		fshader : [//
			// ShaderBuilder.light.prefragment,

			'varying vec3 normal;',
			'varying vec3 viewPosition;',

			'uniform vec3 color;',
			'uniform float opacity;',
			'uniform vec3 light;',

			'void main(void)',
			'{',
			'	vec3 N = normalize(normal);',
			'	vec4 final_color = vec4(color, 1.0);',
			' vec3 lVector = normalize(light);',
			' float dotProduct = dot(N, lVector);',
			' float diffuse = max(dotProduct, 0.0);',
			' final_color.rgb *= (0.5*diffuse+0.5);',

			' final_color.a = opacity;',
			'	gl_FragColor = final_color;',
			'}'//
		].join('\n')
	};

	return Gizmo;
});