goo.BoundingVolumeMeshBuilder = (function (
	BoundingBox,
	BoundingSphere,
	MeshBuilder,
	MeshData,
	Transform
) {
	'use strict';

	/**
	 * Provides methods for building bounding volume debug meshes
	 */
	function BoundingVolumeMeshBuilder() {}

	function buildBox(dx, dy, dz) {
		var verts = [
			 dx,  dy,  dz,
			 dx,  dy, -dz,
			 dx, -dy,  dz,
			 dx, -dy, -dz,
			-dx,  dy,  dz,
			-dx,  dy, -dz,
			-dx, -dy,  dz,
			-dx, -dy, -dz
		];

		var indices = [
			0, 1,
			0, 2,
			1, 3,
			2, 3,

			4, 5,
			4, 6,
			5, 7,
			6, 7,

			0, 4,
			1, 5,
			2, 6,
			3, 7
		];

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length / 3, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	BoundingVolumeMeshBuilder.buildBox = function (boundingBox) {
		var boxMeshData = buildBox(boundingBox.xExtent, boundingBox.yExtent, boundingBox.zExtent);
		// translate vertices to center
		return boxMeshData;
	};

	function buildCircle(radius, nSegments) {
		radius = radius || 1;
		nSegments = nSegments || 8;

		var verts = [];
		var indices = [];

		var ak = Math.PI * 2 / nSegments;
		for (var i = 0, k = 0; i < nSegments; i++, k += ak) {
			verts.push(Math.cos(k) * radius, Math.sin(k) * radius, 0);
			indices.push(i, i + 1);
		}
		indices[indices.length - 1] = 0;

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	function buildSphere(radius) {
		radius = radius || 1;

		var meshBuilder = new MeshBuilder();
		var nSegments = 128;
		var circle = buildCircle(radius, nSegments);
		var transform;

		transform = new Transform();
		meshBuilder.addMeshData(circle, transform);

		transform = new Transform();
		transform.rotation.fromAngles(0, Math.PI / 2, 0);
		transform.update();
		meshBuilder.addMeshData(circle, transform);

		transform = new Transform();
		transform.rotation.fromAngles(Math.PI / 2, Math.PI / 2, 0);
		transform.update();
		meshBuilder.addMeshData(circle, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	BoundingVolumeMeshBuilder.buildSphere = function (boundingSphere) {
		var sphereMeshData = buildSphere(boundingSphere.radius);
		// translate vertices to center
		return sphereMeshData;
	};

	BoundingVolumeMeshBuilder.build = function (boundingVolume) {
		if (boundingVolume instanceof BoundingBox) {
			return BoundingVolumeMeshBuilder.buildBox(boundingVolume);
		} else if (boundingVolume instanceof BoundingSphere) {
			return BoundingVolumeMeshBuilder.buildSphere(boundingVolume);
		}
	};

	return BoundingVolumeMeshBuilder;
})(goo.BoundingBox,goo.BoundingSphere,goo.MeshBuilder,goo.MeshData,goo.Transform);
goo.LightDebug = (function (
	MeshData,
	MeshBuilder,
	Transform,
	Sphere,
	PointLight,
	DirectionalLight,
	SpotLight
) {
	'use strict';

	function LightDebug() {
		this._ball = new Sphere(12, 12, 0.3);
		this._pointLightMesh = LightDebug._buildPointLightMesh();
		this._spotLightMesh = LightDebug._buildSpotLightMesh();
		this._directionalLightMesh = LightDebug._buildDirectionalLightMesh();
	}

	LightDebug.prototype.getMesh = function (light, options) {
		if (light instanceof PointLight) {
			return options.full ? [this._ball, this._pointLightMesh] : [this._ball];
		} else if (light instanceof SpotLight) {
			return options.full ? [this._ball, this._spotLightMesh] : [this._ball];
		} else if (light instanceof DirectionalLight) {
			return options.full ? [this._ball, this._directionalLightMesh] : [this._ball];
		}
	};

	LightDebug._buildPointLightMesh = function () {
		return buildBall();
	};

	LightDebug._buildSpotLightMesh = function () {
		return buildCone();
	};

	LightDebug._buildDirectionalLightMesh = function () {
		return buildColumn();
	};

	function buildCircle(radius, nSegments) {
		radius = radius || 1;
		nSegments = nSegments || 8;

		var verts = [];
		var indices = [];

		var ak = Math.PI * 2 / nSegments;
		for (var i = 0, k = 0; i < nSegments; i++, k += ak) {
			verts.push(Math.cos(k) * radius, Math.sin(k) * radius, 0);
			indices.push(i, i + 1);
		}
		indices[indices.length - 1] = 0;

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	function buildBall() {
		var radius = 1;

		var meshBuilder = new MeshBuilder();
		var nSegments = 128;
		var circle = buildCircle(radius, nSegments);
		var transform;

		transform = new Transform();
		meshBuilder.addMeshData(circle, transform);

		transform = new Transform();
		transform.rotation.fromAngles(0, Math.PI / 2, 0);
		transform.update();
		meshBuilder.addMeshData(circle, transform);

		transform = new Transform();
		transform.rotation.fromAngles(Math.PI / 2, Math.PI / 2, 0);
		transform.update();
		meshBuilder.addMeshData(circle, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	function buildUmbrella(nSegments) {
		nSegments = nSegments || 8;

		var verts = [0, 0, 0];
		var indices = [];

		var ak = Math.PI * 2 / nSegments;
		for (var i = 0, k = 0; i < nSegments; i++, k += ak) {
			verts.push(Math.cos(k), Math.sin(k), 1);
			indices.push(0, i + 1);
		}

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments + 1, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	function buildCone() {
		var length = -1;

		var meshBuilder = new MeshBuilder();

		var nSegments = 64;
		var nParallel = 2;
		var dxParallel = length / 2;
		var dyParallel = dxParallel;

		for (var i = 1; i <= nParallel; i++) {
			var circle = buildCircle(dyParallel * i, nSegments);
			var transform = new Transform();
			transform.translation.setDirect(0, 0, dxParallel * i);
			transform.update();
			meshBuilder.addMeshData(circle, transform);
		}

		var umbrella = buildUmbrella(4);
		var transform = new Transform();
		transform.scale.setDirect(dyParallel * nParallel, dyParallel * nParallel, dxParallel * nParallel);
		transform.update();
		meshBuilder.addMeshData(umbrella, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	function buildTube(nSegments) {
		nSegments = nSegments || 8;

		var verts = [];
		var indices = [];

		var ak = Math.PI * 2 / nSegments;
		for (var i = 0, k = 0; i < nSegments; i++, k += ak) {
			verts.push(Math.cos(k), Math.sin(k), 0);
			verts.push(Math.cos(k), Math.sin(k), 1);
			indices.push(i * 2, i * 2 + 1);
		}

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments * 2, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	function buildColumn() {
		var meshBuilder = new MeshBuilder();

		var nSegments = 64;
		var nParallel = 2;
		var dxParallel = 10 / nParallel;
		var radius = 1;

		for (var i = 0; i < nParallel; i++) {
			var circle = buildCircle(radius, nSegments);
			var transform = new Transform();
			transform.translation.z = -dxParallel * i;
			transform.update();
			meshBuilder.addMeshData(circle, transform);
		}

		var tube = buildTube(4);
		var transform = new Transform();
		transform.scale.setDirect(radius, radius, -dxParallel * nParallel);
		transform.update();
		meshBuilder.addMeshData(tube, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	return LightDebug;
})(goo.MeshData,goo.MeshBuilder,goo.Transform,goo.Sphere,goo.PointLight,goo.DirectionalLight,goo.SpotLight);
goo.CameraDebug = (function (
	MeshData,
	MeshBuilder,
	Transform,
	Vector3,
	Box,
	Cylinder
) {
	'use strict';

	function CameraDebug() {
		this._camera = CameraDebug.buildCamera();
	}

	CameraDebug.prototype.getMesh = function (camera, options) {
		return options.full ? [this._camera, CameraDebug.buildFrustum(camera)] : [this._camera];
	};

	CameraDebug.buildFrustum = function (camera) {
		var near = camera.near;
		var far = camera.far;
		var aspect = camera.aspect;
		var tanFar, tanNear;

		if (camera.projectionMode === 0) {
			var tan = Math.tan(camera.fov / 2 * Math.PI / 180);
			tanFar = tan * far;
			tanNear = tan * near;
		} else {
			var size = camera.size || 100;
			tanFar = size;
			tanNear = size;
		}

		var f0, f1, f2, f3;
		f0 = {
			x: -tanFar * aspect,
			y: tanFar,
			z: -far
		};

		f1 = {
			x: -tanFar * aspect,
			y: -tanFar,
			z: -far
		};

		f2 = {
			x: tanFar * aspect,
			y: -tanFar,
			z: -far
		};

		f3 = {
			x: tanFar * aspect,
			y: tanFar,
			z: -far
		};

		var n0, n1, n2, n3;
		n0 = {
			x: -tanNear * aspect,
			y: tanNear,
			z: -near
		};

		n1 = {
			x: -tanNear * aspect,
			y: -tanNear,
			z: -near
		};

		n2 = {
			x: tanNear * aspect,
			y: -tanNear,
			z: -near
		};

		n3 = {
			x: tanNear * aspect,
			y: tanNear,
			z: -near
		};

		var verts = [];
		verts.push(f0.x, f0.y, f0.z);
		verts.push(f1.x, f1.y, f1.z);
		verts.push(f2.x, f2.y, f2.z);
		verts.push(f3.x, f3.y, f3.z);

		verts.push(n0.x, n0.y, n0.z);
		verts.push(n1.x, n1.y, n1.z);
		verts.push(n2.x, n2.y, n2.z);
		verts.push(n3.x, n3.y, n3.z);

		var indices = [];
		indices.push(0, 1);
		indices.push(1, 2);
		indices.push(2, 3);
		indices.push(3, 0);

		indices.push(4, 5);
		indices.push(5, 6);
		indices.push(6, 7);
		indices.push(7, 4);

		indices.push(0, 4);
		indices.push(1, 5);
		indices.push(2, 6);
		indices.push(3, 7);

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 8, 24);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	};

	CameraDebug.buildCamera = function () {
		var meshBuilder = new MeshBuilder();
		var transform = new Transform();

		var cameraBox1 = new Cylinder(32, 0.6);
		var cameraBox2 = new Cylinder(32, 0.6);
		var cameraBox3 = new Box(0.3, 1, 1.6);

		var cameraBox4 = new Box(0.2, 0.15, 0.7);
		cameraBox4.applyFunction(MeshData.POSITION, function (vert) {
			return new Vector3(
				vert.x + vert.x / ((vert.z + 1.1) * 0.3),
				vert.y + vert.y / ((vert.z + 1.1) * 0.3),
				vert.z
			);
		});

		transform.translation.setDirect(0.0, 0.0, 0.0);
		transform.update();
		meshBuilder.addMeshData(cameraBox4, transform);

		transform.translation.setDirect(0.0, 0.0, 1.3);
		transform.update();
		meshBuilder.addMeshData(cameraBox3, transform);

		transform.scale.setDirect(1.0, 1.0, 0.5);
		transform.setRotationXYZ(0.0, Math.PI / 2, 0.0);

		transform.translation.setDirect(0.0, 1.2, 0.6);
		transform.update();
		meshBuilder.addMeshData(cameraBox1, transform);

		transform.translation.setDirect(0.0, 1.2, 2.0);
		transform.update();
		meshBuilder.addMeshData(cameraBox2, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	};

	return CameraDebug;
})(goo.MeshData,goo.MeshBuilder,goo.Transform,goo.Vector3,goo.Box,goo.Cylinder);
goo.MeshRendererDebug = (function (
	MeshData
) {
	'use strict';

	function MeshRendererDebug() {
		this._meshes = [buildBox(1, 1, 1), null];
	}

	MeshRendererDebug.prototype.getMesh = function () {
		return this._meshes;
	};

	function buildBox(dx, dy, dz) {
		var verts = [
			 dx,  dy,  dz,
			 dx,  dy, -dz,
			 dx, -dy,  dz,
			 dx, -dy, -dz,
			-dx,  dy,  dz,
			-dx,  dy, -dz,
			-dx, -dy,  dz,
			-dx, -dy, -dz
		];

		var indices = [
			0, 1,
			0, 2,
			1, 3,
			2, 3,

			4, 5,
			4, 6,
			5, 7,
			6, 7,

			0, 4,
			1, 5,
			2, 6,
			3, 7
		];

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length / 3, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	return MeshRendererDebug;
})(goo.MeshData);
goo.SkeletonDebug = (function (
	Box,
	Transform,
	Joint,
	MeshBuilder,
	MeshData
) {
	'use strict';
	function SkeletonDebug() {}
	var calcTrans = new Transform();

	SkeletonDebug.prototype.getMesh = function (pose) {
		var joints = pose._skeleton._joints;
		return [
			this._buildLines(joints),
			this._buildBoxes(joints)
		];
	};

	SkeletonDebug.prototype._buildBoxes = function (joints) {
		var boxBuilder = new MeshBuilder();

		var box = new Box(2, 2, 2);
		box.attributeMap.WEIGHTS = MeshData.createAttribute(4, 'Float');
		box.attributeMap.JOINTIDS = MeshData.createAttribute(4, 'Float');
		box.rebuildData();
		box.rebuild();

		for (var i = 0; i < joints.length; i++) {
			calcTrans.matrix.copy(joints[i]._inverseBindPose.matrix)
				.invert();
			this._stuffBox(box, joints[i]);
			boxBuilder.addMeshData(box, calcTrans);
		}

		var meshes = boxBuilder.build();
		var boxes = meshes[0];
		this._buildPaletteMap(boxes, joints);
		return boxes;
	};

	SkeletonDebug.prototype._buildLines = function (joints) {
		var positions = [], weights = [], jointIds = [],
			indices = [], count = 0, td = calcTrans.matrix.data;

		for (var i = 0; i < joints.length; i++) {
			var joint = joints[i];
			if (joint._parentIndex !== Joint.NO_PARENT) {
				var parentJoint = joints[joint._parentIndex];
				weights.push(1, 0, 0, 0, 1, 0, 0, 0);
				jointIds.push(joint._index, 0, 0, 0, parentJoint._index, 0, 0, 0);
				indices.push(count * 2, count * 2 + 1);
				count++;

				calcTrans.matrix.copy(joint._inverseBindPose.matrix).invert();
				positions.push(td[12], td[13], td[14]);
				calcTrans.matrix.copy(parentJoint._inverseBindPose.matrix).invert();
				positions.push(td[12], td[13], td[14]);
			}
		}
		// Lines for bones
		var line = new MeshData(
			MeshData.defaultMap([
				MeshData.POSITION,
				MeshData.WEIGHTS,
				MeshData.JOINTIDS
			]), positions.length / 3, indices.length);
		line.indexModes = ['Lines'];
		line.getAttributeBuffer(MeshData.POSITION).set(positions);
		line.getAttributeBuffer(MeshData.WEIGHTS).set(weights);
		line.getAttributeBuffer(MeshData.JOINTIDS).set(jointIds);
		line.getIndexBuffer().set(indices);

		this._buildPaletteMap(line, joints);
		return line;
	};

	SkeletonDebug.prototype._stuffBox = function (box, joint) {
		var weights = box.getAttributeBuffer('WEIGHTS');
		var jointIds = box.getAttributeBuffer('JOINTIDS');
		for (var i = 0; i < weights.length; i += 4) {
			weights[i] = 1;
			jointIds[i] = joint._index;
		}
	};

	SkeletonDebug.prototype._buildPaletteMap = function (meshData, joints) {
		var paletteMap = [];
		for (var i = 0; i < joints.length; i++) {
			paletteMap[i] = joints[i]._index;
		}
		meshData.paletteMap = paletteMap;
		meshData.weightsPerVertex = 4;
	};

	return SkeletonDebug;
})(goo.Box,goo.Transform,goo.Joint,goo.MeshBuilder,goo.MeshData);
goo.DebugDrawHelper = (function (
	LightComponent,
	CameraComponent,
	MeshRendererComponent,
	SkeletonPose,

	PointLight,
	DirectionalLight,
	SpotLight,

	LightDebug,
	CameraDebug,
	MeshRendererDebug,
	SkeletonDebug,
	Material,
	ShaderLib,
	ShaderBuilder,
	Transform,
	Camera,
	Renderer
) {
	'use strict';
	var DebugDrawHelper = {};

	var lightDebug = new LightDebug();
	var cameraDebug = new CameraDebug();
	var meshRendererDebug = new MeshRendererDebug();
	var skeletonDebug = new SkeletonDebug();

	DebugDrawHelper.getRenderablesFor = function (component, options) {
		var meshes, material;

		if (component.type === 'LightComponent') {
			meshes = lightDebug.getMesh(component.light, options);
			material = new Material(ShaderLib.simpleColored, 'DebugDrawLightMaterial');
		} else if (component.type === 'CameraComponent') {
			meshes = cameraDebug.getMesh(component.camera, options);
			material = new Material(ShaderLib.simpleLit, 'DebugDrawCameraMaterial');

			material.uniforms.materialAmbient = [0.4, 0.4, 0.4, 1];
			material.uniforms.materialDiffuse = [0.6, 0.6, 0.6, 1];
			material.uniforms.materialSpecular = [0.0, 0.0, 0.0, 1];
		} else if (component.type === 'MeshRendererComponent') {
			meshes = meshRendererDebug.getMesh();
			material = new Material(ShaderLib.simpleColored, 'DebugMeshRendererComponentMaterial');
		} else if (component instanceof SkeletonPose) {
			meshes = skeletonDebug.getMesh(component, options);
			var materials = [
				new Material(ShaderLib.uber, 'SkeletonDebugMaterial'),
				new Material(ShaderLib.uber, 'SkeletonDebugMaterial')
			];
			var renderables = [];
			var len = materials.length;
			while (len--) {
				var material = materials[len];
				material.depthState = {
					enabled: false,
					write: false
				};
				material.renderQueue = 3000;
				material.uniforms.materialDiffuse = [0, 0, 0, 1];
				material.uniforms.materialDiffuse[len] = 0.8;
				material.uniforms.materialAmbient = [0, 0, 0, 1];
				material.uniforms.materialAmbient[len] = 0.5;
				renderables[len] = {
					meshData: meshes[len],
					transform: new Transform(),
					materials: [material],
					currentPose: component
				};
			}
			return renderables;
		}

		return meshes.map(function (mesh) {
			return {
				meshData: mesh,
				transform: new Transform(),
				materials: [material]
			};
		});
	};

	DebugDrawHelper.update = function (renderables, component, camera) {
		// major refactoring needed here

		// rebuilding camera frustum if needed
		if (component.camera && component.camera.changedProperties) {
			var camera = component.camera;
			if (renderables.length > 1 &&
				((camera.far / camera.near) !== renderables[1].farNear ||
					camera.fov !== renderables[1].fov ||
					camera.size !== renderables[1].size ||
					camera.aspect !== renderables[1].aspect ||
					camera.projectionMode !== renderables[1].projectionMode
				)) {
				renderables[1].meshData = CameraDebug.buildFrustum(camera);
				renderables[1].farNear = camera.far / camera.near;
				renderables[1].fov = camera.fov;
				renderables[1].size = camera.size;
				renderables[1].aspect = camera.aspect;
				renderables[1].projectionMode = camera.projectionMode;
			}
			component.camera.changedProperties = false;
		}

		// updating materials
		DebugDrawHelper[component.type].updateMaterial(renderables[0].materials[0], component);
		if (renderables[1]) { DebugDrawHelper[component.type].updateMaterial(renderables[1].materials[0], component); }
		// updating the transform on the second element which is assumed to need this
		if (renderables[1]) { DebugDrawHelper[component.type].updateTransform(renderables[1].transform, component); }

		// keeping scale the same on the first element which is assumed to always be the camera mesh/light 'bulb'
		var mainCamera = Renderer.mainCamera;
		if (mainCamera) {
			var camPosition = mainCamera.translation;
			var scale = renderables[0].transform.translation.distance(camPosition) / 30;
			if (mainCamera.projectionMode === Camera.Parallel) {
				scale = (mainCamera._frustumTop - mainCamera._frustumBottom) / 20;
			}
			renderables[0].transform.scale.setDirect(scale, scale, scale);
			renderables[0].transform.update();

			// keeping scale for directional light mesh since scale is meaningless for it
			if (component.light && component.light instanceof DirectionalLight) {
				if (renderables[1]) { renderables[1].transform.scale.scale(scale); } // not enough scale!
				if (renderables[1]) { renderables[1].transform.update(); }
			}
		}
	};

	DebugDrawHelper.LightComponent = {};
	DebugDrawHelper.CameraComponent = {};

	DebugDrawHelper.LightComponent.updateMaterial = function (material, component) {
		var light = component.light;
		var color = material.uniforms.color = material.uniforms.color || [];
		color[0] = light.color.x;
		color[1] = light.color.y;
		color[2] = light.color.z;
	};

	DebugDrawHelper.LightComponent.updateTransform = function (transform, component) {
		var light = component.light;
		if (!(light instanceof DirectionalLight)) {
			var range = light.range;
			transform.scale.setDirect(range, range, range);
			if (light instanceof SpotLight) {
				var angle = light.angle * Math.PI / 180;
				var tan = Math.tan(angle / 2);
				transform.scale.mulDirect(tan, tan, 1);
			}
		}
		transform.update();
	};

	DebugDrawHelper.CameraComponent.updateMaterial = function (material/*, component*/) {
		material.uniforms.color = material.uniforms.color || [1, 1, 1];
	};

	DebugDrawHelper.CameraComponent.updateTransform = function (/*transform, component*/) {
		// var camera = component.camera;
		// var z = camera.far;
		// var y = z * Math.tan(camera.fov / 2 * Math.PI/180);
		// var x = y * camera.aspect;
		// transform.scale.setDirect(x, y, z);
		// transform.update();
	};

	return DebugDrawHelper;
})(goo.LightComponent,goo.CameraComponent,goo.MeshRendererComponent,goo.SkeletonPose,goo.PointLight,goo.DirectionalLight,goo.SpotLight,goo.LightDebug,goo.CameraDebug,goo.MeshRendererDebug,goo.SkeletonDebug,goo.Material,goo.ShaderLib,goo.ShaderBuilder,goo.Transform,goo.Camera,goo.Renderer);
goo.MarkerComponent = (function (
	Component,
	BoundingVolumeMeshBuilder) {
	'use strict';

	/**
	 * Holds the necessary data for a marker
	 * @param {Entity} entity The entity this component is attached to
	 * @extends Component
	 */
	function MarkerComponent(hostEntity) {
		Component.apply(this, arguments);

		this.type = 'MarkerComponent';

		var hostModelBound = hostEntity.meshRendererComponent.worldBound;
		//this.meshData = ShapeCreator.createBox(hostModelBound.radius * 2, hostModelBound.radius * 2, hostModelBound.radius * 2);
		this.meshData = BoundingVolumeMeshBuilder.build(hostModelBound);
	}

	MarkerComponent.prototype = Object.create(Component.prototype);
	MarkerComponent.prototype.constructor = MarkerComponent;

	return MarkerComponent;
})(goo.Component,goo.BoundingVolumeMeshBuilder);
goo.MarkerSystem = (function (
	System,
	Material,
	ShaderLib,
	MarkerComponent,
	Renderer,
	Transform
) {
	'use strict';

	/**
	 * Processes all entities with a marker component
	 * @extends System
	 */
	function MarkerSystem(goo) {
		System.call(this, 'MarkerSystem', ['MarkerComponent']);

		this.material = new Material(ShaderLib.simpleColored);
		this.material.depthState.enabled = false;
		this.material.shader.uniforms.color = [0.0, 1.0, 0.0];

		this.goo = goo;
		this.renderer = this.goo.renderer;

		this.entities = [];

		// drawing needs to be performed AFTER the render system completes its execution
		this.goo.callbacks.push(function () {
			for (var i = 0; i < this.entities.length; i++) {
				var entity = this.entities[i];
				if (entity.hasComponent('MarkerComponent')) {
					var transform = new Transform();
					transform.copy(entity.transformComponent.worldTransform);
					transform.setRotationXYZ(0, 0, 0);
					transform.scale.setDirect(1, 1, 1);
					transform.update();

					var renderableMarker = {
						meshData: entity.markerComponent.meshData,
						materials: [this.material],
						transform: transform
					};

					this.goo.renderer.render(renderableMarker, Renderer.mainCamera, [], null, false);
				}
			}
		}.bind(this));
	}

	MarkerSystem.prototype = Object.create(System.prototype);

	MarkerSystem.prototype.process = function (entities) {
		this.entities = entities;
	};

	return MarkerSystem;
})(goo.System,goo.Material,goo.ShaderLib,goo.MarkerComponent,goo.Renderer,goo.Transform);
goo.Debugger = (function (
	MarkerComponent,
	MarkerSystem
) {
	'use strict';

	//! AT: unused; should be removed
	/**
	 * The debugger utility class adds a way to "select" entities and run a filtered serializer on them. It can also create a REPL and export the selected entity to global scope to aid in debugging with the browser's web console.
	 * @param {boolean} [exportPicked] True if the debugger should create and update window.picked that points to the currently picked entity
	 * @param {boolean} [maximumDeph] True if the debugger should come with it's own REPL
	 */
	function Debugger(exportPicked) {
		this.goo = null;
		this.exportPicked = exportPicked || false;
		this.picked = null;
		this.oldPicked = null;
	}

	/**
	 * Sets event listeners on the REPL
	 * @private
	 */
	Debugger.prototype._setUpREPL = function () {
		var lastCommStr = '';

		// repl keypresses
		document.getElementById('replintex').addEventListener('keyup', function (event) {
			/* jshint evil: true */
			//event.preventDefault();
			event.stopPropagation();
			var replinElemHandle = document.getElementById('replintex');
			var reploutElemHandle = document.getElementById('replouttex');
			if (event.keyCode === 13 && !event.shiftKey) {
				var commStr = replinElemHandle.value.substr(0, replinElemHandle.value.length - 1);
				lastCommStr = commStr;

				// setup variables for eval scope
				var entity = this.picked;
				var goo = this.goo;

				var resultStr = '';
				try {
					resultStr += eval(commStr);
				} catch(err) {
					resultStr += err;
				}
				replinElemHandle.value = 'entity.';
				reploutElemHandle.value += '\n-------\n' + resultStr;

				displayInfo(this.picked);
			} else if (event.keyCode === 38) {
				replinElemHandle.value = lastCommStr;
			}
		}.bind(this), false);
	};

	/**
	 * Sets up the picking system
	 * @private
	 */
	Debugger.prototype._setUpPicking = function () {
		// picking entities
		document.addEventListener('mouseup', function (event) {
			//event.preventDefault();
			event.stopPropagation();

			var mouseDownX = event.pageX;
			var mouseDownY = event.pageY;

			this.goo.pick(mouseDownX, mouseDownY, function (id) {
				var entity = this.goo.world.entityManager.getEntityByIndex(id);
				if (entity) {
					this.oldPicked = this.picked;
					this.picked = entity;

					if (this.picked === this.oldPicked) { this.picked = null; }

					if (this.exportPicked) { window.picked = this.picked; }
					displayInfo(this.picked);
					updateMarker(this.picked, this.oldPicked);
				}
			}.bind(this));
		}.bind(this), false);
	};

	/**
	 * Inject the debugger into the engine and create the debug panel
	 *
	 * @param {GooRunner} goo A GooRunner reference
	 * @returns {Debugger} Self to allow chaining
	 */
	Debugger.prototype.inject = function (goo) {
		this.goo = goo;

		createPanel();

		// adding marker system if there is none
		if (!this.goo.world.getSystem('MarkerSystem')) {
			this.goo.world.setSystem(new MarkerSystem(this.goo));
		}

		this._setUpPicking();

		// setting up onchange for debug parameter filters
		document.getElementById('debugparams').addEventListener('keyup', function () {
			displayInfo(this.picked);
		}.bind(this));

		this._setUpREPL();

		return this;
	};

	/**
	 * Builds and appends the GUI for the debugger
	 * @memberOf Debugger#
	 * @private
	 * @param {boolean} ownREPL True if the debugger should supply its own REPL
	 */
	function createPanel() {
		var div = document.createElement('div');
		div.id = 'debugdiv';
		// serializer
		var innerHTML =
			'<span style="font-size: x-small;font-family: sans-serif">Filter</span><br />' +
			'<textarea cols="30" id="debugparams">name, Compo, tran, data</textarea><br />' +
			'<span style="font-size: x-small;font-family: sans-serif">Result</span><br />' +
			'<textarea readonly rows="10" cols="30" id="debugtex">Click on an entity</textarea><br />';
		// repl
		innerHTML += '<hr />' +
			'<span style="font-size: x-small;font-family: sans-serif">REPL</span><br />' +
			'<textarea readonly rows="10" cols="30" id="replouttex">...</textarea><br />' +
			'<textarea cols="30" id="replintex">entity.</textarea>';
		div.innerHTML = innerHTML;
		div.style.position = 'absolute';
		div.style.zIndex = '2001';
		div.style.backgroundColor = '#DDDDDD';
		div.style.left = '10px';
		div.style.top = '100px';
		div.style.webkitTouchCallout = 'none';
		div.style.webkitUserSelect = 'none';
		div.style.khtmlUserSelect = 'none';
		div.style.mozUserSelect = 'none';
		div.style.msUserSelect = 'none';
		div.style.userSelect = 'none';

		div.style.padding = '3px';
		div.style.borderRadius = '6px';

		document.body.appendChild(div);
	}

	/**
	 * Transforms a string into an array of regexps
	 * @memberOf Debugger#
	 * @private
	 * @param {string} str
	 * @returns {Array}
	 */
	function getFilterList(str) {
		return str.split(',').map(function (entry) {
				return entry.replace(/(^[\s]+|[\s]+$)/g, '');
			}).filter(function (entry) {
				return entry.length > 0;
			}).map(function (entry) {
				return new RegExp(entry);
			});
	}

	// JSON.stringy handles typed arrays as objects ("0": 0, "1": 0, "2": 0, "3": 0 ... )
	function stringifyTypedArray(typedArray) {
		if (typedArray.length === 0) { return '[]'; }

		var ret = '[' + typedArray[0];
		for (var i = 1; i < typedArray.length; i++) {
			ret += ' ' + typedArray[i];
		}
		ret += ']';
		return ret;
	}

	/**
	 * Walks on the property tree of an object and return a string containing properties matched by a list of interests
	 * @memberOf Debugger#
	 * @private
	 * @param {Object} obj Root object to start the walk from
	 * @param {Array<RegExp>} interests A list of Regexps to filter the properties the walker is visiting
	 * @returns {string}
	 */
	function filterProperties(obj, interests, ident, recursionDeph) {
		if (interests.length === 0) {
			return 'No interests specified;\n\n' +
				'Some popular interests: is, tran, Compo\n\n' +
				'Every entry separated by a comma is a regex';
		}

		if (recursionDeph < 0) { return ident + 'REACHED MAXIMUM DEPH\n'; }

		// null
		if (obj === null) { return ident + 'null\n'; }

		// 'primitive' types and arrays or primitive types
		var typeOfObj = typeof obj;
		if (typeOfObj === 'undefined' ||
			typeOfObj === 'number' ||
			typeOfObj === 'boolean' ||
			typeOfObj === 'string' ||
			(obj instanceof Array && (typeof obj[0] === 'string' || typeof obj[0] === 'number' || typeof obj[0] === 'boolean'))) {
			return ident + JSON.stringify(obj) + '\n';
		}

		// typed arrays
		if (Object.prototype.toString.call(obj).indexOf('Array]') !== -1) {
			return ident + stringifyTypedArray(obj) + '\n';
		}
		// generic objects
		else {
			var retArr = [];
			// go through all the properties of a function
			for (var prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					// skip if function
					if (typeof obj[prop] === 'function') { continue; }

					// explore further if it matches with at least one interest
					for (var i in interests) {
						if (interests[i].test(prop)) {
							var filterStr = filterProperties(obj[prop], interests, ident + ' ', recursionDeph - 1);
							retArr.push(ident + prop + '\n' + filterStr);
							break;
						}
					}
				}
			}
			return retArr.join('');
		}
	}

	/**
	 * Takes away the marker component of the previously picked entity and sets a marker component on the current picked entity
	 * @memberOf Debugger#
	 * @private
	 * @param picked
	 * @param oldPicked
	 */
	function updateMarker(picked, oldPicked) {
		if (picked !== oldPicked) {
			if (oldPicked !== null && oldPicked.hasComponent('MarkerComponent')) {
				oldPicked.clearComponent('MarkerComponent');
			}
			if (picked !== null) {
				picked.setComponent(new MarkerComponent(picked));
			}
		}
		else {
			if (picked.hasComponent('MarkerComponent')) {
				picked.clearComponent('MarkerComponent');
			} else {
				picked.setComponent(new MarkerComponent(picked));
			}
		}
	}

	/**
	 * Builds the interest list and performs the walk on the supplied entity
	 * @memberOf Debugger#
	 * @private
	 * @param {Entity} entity
	 */
	function displayInfo(entity) {
		var filterList = getFilterList(document.getElementById('debugparams').value);

		if (entity) { console.log('==> ', entity); }

		var entityStr = filterProperties(entity, filterList, '', 20);

		var elem = document.getElementById('debugtex');
		elem.value = entityStr;
	}

	return Debugger;
})(goo.MarkerComponent,goo.MarkerSystem);
goo.EntityCounter = (function () {
	'use strict';

	/**
	 * The entity counter utility class creates a panel and updates it with data on the systems in the world and how many entities each contains
	 * @param {number} [skipFrames] Sets how many frames should it skip between refreshes
	 */
	function EntityCounter(skipFrames) {
		this.goo = null;
		this.skipFrames = skipFrames || 20;
		this.texHandle = null;
	}

	/**
	 * Inject the entity counter into the GooRunner instance and create the entity counter panel
	 *
	 * @param {GooRunner} goo A GooRunner reference
	 * @returns {EntityCounter} Self to allow chaining
	 */
	EntityCounter.prototype.inject = function (goo) {
		this.goo = goo;

		this.texHandle = createPanel();
		var that = this;

		var skippedFrame = 0;
		this.goo.callbacks.push(function () {
			skippedFrame--;
			if (skippedFrame <= 0) {
				skippedFrame = that.skipFrames;
				var outStr = '';

				for (var i in that.goo.world._systems) {
					var system = that.goo.world._systems[i];
					outStr += system.type + ': ' + system._activeEntities.length + '\n';
				}

				that.texHandle.value = outStr;
			}
		});

		return this;
	};

	/**
	 * Builds and appends the GUI for the entity counter
	 * @memberOf EntityCounter#
	 * @private
	 */
	function createPanel() {
		var div = document.createElement('div');
		div.id = '_entitycounterdiv';
		var innerHTML =
			'<span style="font-size: x-small;font-family: sans-serif">Counter</span><br />' +
			'<textarea cols="30" rows="6" id="_entitycountertex">...</textarea>';
		div.innerHTML = innerHTML;
		div.style.position = 'absolute';
		div.style.zIndex = '2001';
		div.style.backgroundColor = '#BBBBBB';
		div.style.left = '10px';
		div.style.bottom = '10px';
		div.style.webkitTouchCallout = 'none';
		div.style.webkitUserSelect = 'none';
		div.style.khtmlUserSelect = 'none';
		div.style.mozUserSelect = 'none';
		div.style.msUserSelect = 'none';
		div.style.userSelect = 'none';

		div.style.padding = '3px';
		div.style.borderRadius = '6px';

		document.body.appendChild(div);

		return document.getElementById('_entitycountertex');
	}

	return EntityCounter;
})();
goo.DebugRenderSystem = (function (
	System,
	SystemBus,
	SimplePartitioner,
	Material,
	ShaderLib,
	DebugDrawHelper
) {
	'use strict';

	/**
	 * Renders entities/renderables using a configurable partitioner for culling
	 * @property {boolean} doRender Only render if set to true
	 * @extends System
	 */
	function DebugRenderSystem() {
		System.call(this, 'DebugRenderSystem', ['TransformComponent']);

		this._renderablesTree = {};
		this.renderList = [];
		this.preRenderers = []; // unused
		this.composers = []; // unused
		this.doRender = {
			CameraComponent: false,
			LightComponent: false,
			MeshRendererComponent: false,
			SkeletonPose: false
		};
		this.inserted();

		this._interestComponents = [
			'CameraComponent',
			'LightComponent'
			//'MeshRendererComponent'
		];

		this.camera = null;
		this.lights = [];
		this.currentTpf = 0.0;
		this.scale = 20;

		this.cameraListener = function (newCam) {
			this.camera = newCam.camera;
		}.bind(this);

		this.lightsListener = function (lights) {
			this.lights = lights;
		}.bind(this);

		this.selectionRenderable = DebugDrawHelper.getRenderablesFor({ type: 'MeshRendererComponent' });
		this.selectionActive = false;
		this.oldSelectionActive = false;
	}

	DebugRenderSystem.prototype = Object.create(System.prototype);
	DebugRenderSystem.prototype.constructor = DebugRenderSystem;

	DebugRenderSystem.prototype.setup = function () {
		SystemBus.addListener('goo.setCurrentCamera', this.cameraListener);
		SystemBus.addListener('goo.setLights', this.lightsListener);
	};

	DebugRenderSystem.prototype.inserted = function (/*entity*/) {
	};

	DebugRenderSystem.prototype.deleted = function (entity) {
		delete this._renderablesTree[entity.id];
	};

	DebugRenderSystem.prototype.process = function (entities, tpf) {
		var count = this.renderList.length = 0;
		var renderables;
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			for (var j = 0, max = this._interestComponents.length; j < max; j++) {
				var componentName = this._interestComponents[j];
				if (!entity._hidden && entity.hasComponent(componentName)) {
					var component = entity.getComponent(componentName);

					var options = { full: this.doRender[componentName] || entity.getComponent(componentName).forceDebug };
					var tree = this._renderablesTree[entity.id] = this._renderablesTree[entity.id] || {};

					if (tree[componentName] && ((tree[componentName].length === 2 && options.full) || (tree[componentName].length === 1 && !options.full))) {
						renderables = tree[componentName];
					} else {
						renderables = DebugDrawHelper.getRenderablesFor(component, options);
						for (var k = 0; k < renderables.length; k++) {
							var renderable = renderables[k];
							renderable.id = entity.id;
							renderable._index = entity._index;
						}
						tree[componentName] = renderables;
					}

					for (var k = 0; k < renderables.length; k++) {
						var renderable = renderables[k];
						renderable.transform.translation.set(entity.transformComponent.worldTransform.translation);
						renderable.transform.rotation.copy(entity.transformComponent.worldTransform.rotation);
						renderable.transform.scale.setDirect(1, 1, 1);
						renderable.transform.update();
					}
					DebugDrawHelper.update(renderables, component, this.camera);
					for (var k = 0; k < renderables.length; k++) {
						this.renderList[count++] = renderables[k];
					}
				}
			}
			// Skeleton debug
			if (this.doRender.SkeletonPose && entity.meshDataComponent && entity.meshDataComponent.currentPose) {
				var pose = entity.meshDataComponent.currentPose;
				var tree = this._renderablesTree[entity.id] = this._renderablesTree[entity.id] || {};
				if (tree.skeleton) {
					renderables = tree.skeleton;
				} else {
					renderables = DebugDrawHelper.getRenderablesFor(pose);
					for (var k = 0; k < renderables.length; k++) {
						renderables[k].id = entity.id;
					}
					tree.skeleton = renderables;
				}
				for (var k = 0; k < renderables.length; k++) {
					var renderable = renderables[k];
					renderable.transform.copy(entity.transformComponent.worldTransform);
					this.renderList[count++] = renderable;
				}
			}
		}

		if (this.selectionActive) {
			this.renderList[count++] = this.selectionRenderable[0];
		}
		this.renderList.length = count;
		this.currentTpf = tpf;
	};

	DebugRenderSystem.prototype.render = function (renderer) {
		renderer.checkResize(this.camera);

		if (this.camera) {
			renderer.render(this.renderList, this.camera, this.lights, null, false);
		}
	};

	DebugRenderSystem.prototype.renderToPick = function (renderer, skipUpdateBuffer) {
		renderer.renderToPick(this.renderList, this.camera, false, skipUpdateBuffer);
	};

	DebugRenderSystem.prototype.invalidateHandles = function (renderer) {
		var entityIds = Object.keys(this._renderablesTree);
		entityIds.forEach(function (entityId) {
			var components = this._renderablesTree[entityId];

			var componentTypes = Object.keys(components);
			componentTypes.forEach(function (componentType) {
				var renderables = components[componentType];

				renderables.forEach(function (renderable) {
					renderable.materials.forEach(function (material) {
						renderer.invalidateMaterial(material);
					});

					renderer.invalidateMeshData(renderable.meshData);
				});
			});
		}.bind(this));

		// there are 2 selection renderables, but one has a null meshData (it's beyond me why it's like that)
		this.selectionRenderable[0].materials.forEach(function (material) {
			renderer.invalidateMaterial(material);
		});

		renderer.invalidateMeshData(this.selectionRenderable[0].meshData);
	};

	DebugRenderSystem.prototype.cleanup = function () {
		SystemBus.removeListener('goo.setCurrentCamera', this.cameraListener);
		SystemBus.removeListener('goo.setLights', this.lightsListener);
	};

	return DebugRenderSystem;
})(goo.System,goo.SystemBus,goo.SimplePartitioner,goo.Material,goo.ShaderLib,goo.DebugDrawHelper);
if (typeof require === "function") {
define("goo/debugpack/BoundingVolumeMeshBuilder", [], function () { return goo.BoundingVolumeMeshBuilder; });
define("goo/debugpack/shapes/LightDebug", [], function () { return goo.LightDebug; });
define("goo/debugpack/shapes/CameraDebug", [], function () { return goo.CameraDebug; });
define("goo/debugpack/shapes/MeshRendererDebug", [], function () { return goo.MeshRendererDebug; });
define("goo/debugpack/shapes/SkeletonDebug", [], function () { return goo.SkeletonDebug; });
define("goo/debugpack/DebugDrawHelper", [], function () { return goo.DebugDrawHelper; });
define("goo/debugpack/components/MarkerComponent", [], function () { return goo.MarkerComponent; });
define("goo/debugpack/systems/MarkerSystem", [], function () { return goo.MarkerSystem; });
define("goo/debugpack/Debugger", [], function () { return goo.Debugger; });
define("goo/debugpack/EntityCounter", [], function () { return goo.EntityCounter; });
define("goo/debugpack/systems/DebugRenderSystem", [], function () { return goo.DebugRenderSystem; });
}
