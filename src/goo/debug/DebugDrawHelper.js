define([
	'goo/entities/components/LightComponent',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/MeshRendererComponent',

	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',

	'goo/shapes/debug/LightDebug',
	'goo/shapes/debug/CameraDebug',
	'goo/shapes/debug/MeshRendererDebug',
	'goo/renderer/Material',
	'goo/renderer/Util',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/math/Transform'
], function(
	LightComponent,
	CameraComponent,
	MeshRendererComponent,

	PointLight,
	DirectionalLight,
	SpotLight,

	LightDebug,
	CameraDebug,
	MeshRendererDebug,
	Material,
	Util,
	ShaderLib,
	ShaderBuilder,
	Transform
) {
	'use strict';
	var DebugDrawHelper = {};

	var lightDebug = new LightDebug();
	var cameraDebug = new CameraDebug();
	var meshRendererDebug = new MeshRendererDebug();

	DebugDrawHelper.getRenderablesFor = function(component, options) {
		var meshes, material;

		if(component.type === 'LightComponent') {
			meshes = lightDebug.getMesh(component.light, options);
			material = Material.createMaterial(ShaderLib.simpleColored, 'DebugDrawLightMaterial');
		} else if (component.type === 'CameraComponent') {
			meshes = cameraDebug.getMesh(component.camera, options);
			material = Material.createMaterial(ShaderLib.simpleLit, 'DebugDrawCameraMaterial');

			material.uniforms.materialAmbient = [0.2, 0.2, 0.2, 1];
			material.uniforms.materialDiffuse = [0.8, 0.8, 0.8, 1];
			material.uniforms.materialSpecular = [0.0, 0.0, 0.0, 1];
		} else if (component.type === 'MeshRendererComponent') {
			meshes = meshRendererDebug.getMesh();
			material = Material.createMaterial(ShaderLib.simpleColored, 'DebugMeshRendererComponentMaterial');
		}

		return meshes.map(function (mesh) {
			return {
				meshData: mesh,
				transform: new Transform(),
				materials: [material]
			};
		});
	};

	DebugDrawHelper.update = function(renderables, component, camPosition) {
		// major refactoring needed here

		// rebuilding camera frustum if needed
		if(component.camera && component.camera.changedProperties) {
			var camera = component.camera;
			if(renderables.length > 1 && (camera.far / camera.near) !== renderables[1].farNear) {
				renderables[1].meshData = CameraDebug.buildFrustum(camera.far / camera.near);
				renderables[1].farNear = camera.far / camera.near;
			}
			component.camera.changedProperties = false;
		}

		// updating materials
		DebugDrawHelper[component.type].updateMaterial(renderables[0].materials[0], component);
		if (renderables[1]) DebugDrawHelper[component.type].updateMaterial(renderables[1].materials[0], component);
		// updating the transform on the second element which is assumed to need this
		if (renderables[1]) DebugDrawHelper[component.type].updateTransform(renderables[1].transform, component);

		// keeping scale the same on the first element which is assumed to always be the camera mesh/light 'bulb'
		var scale = renderables[0].transform.translation.distance(camPosition) / 30;
		renderables[0].transform.scale.setd(scale,scale,scale);
		renderables[0].transform.update();

		// keeping scale for directional light mesh since scale is meaningless for it
		if (component.light && component.light instanceof DirectionalLight) {
			if (renderables[1]) renderables[1].transform.scale.scale(scale); // not enough scale!
			if (renderables[1]) renderables[1].transform.update();
		}
	};

	DebugDrawHelper.LightComponent = {};
	DebugDrawHelper.CameraComponent = {};

	DebugDrawHelper.LightComponent.updateMaterial = function(material, component) {
		var light = component.light;
		var color = material.uniforms.color = material.uniforms.color || [];
		color[0] = light.color.data[0];
		color[1] = light.color.data[1];
		color[2] = light.color.data[2];
	};

	DebugDrawHelper.LightComponent.updateTransform = function(transform, component) {
		var light = component.light;
		if (!(light instanceof DirectionalLight)) {
			var r = light.range;
			transform.scale.setd(r,r,r);
			if (light instanceof SpotLight) {
				var angle = light.angle * Math.PI / 180;
				var tan = Math.tan(angle / 2);
				transform.scale.muld(tan, tan, 1);
			}
		}
		transform.update();
	};

	DebugDrawHelper.CameraComponent.updateMaterial = function(material/*, component*/) {
		material.uniforms.color = material.uniforms.color || [1, 1, 1];
	};

	DebugDrawHelper.CameraComponent.updateTransform = function(transform, component) {
		var camera = component.camera;
		var z = camera.far;
		var y = z * Math.tan(camera.fov/2 * Math.PI/180);
		var x = y * camera.aspect;
		transform.scale.setd(x, y, z);
		transform.update();
	};

	return DebugDrawHelper;
});