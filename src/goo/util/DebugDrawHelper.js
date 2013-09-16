define([
	'goo/entities/components/LightComponent',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/MeshRendererComponent',

	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',

	'goo/shapes/debug/LightDebug',
	'goo/shapes/debug/CameraDebug',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
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
	Material,
	ShaderLib,
	Transform
) {
	'use strict';
	var DebugDrawHelper = {};

	var lightDebug = new LightDebug();
	var cameraDebug = new CameraDebug();

	DebugDrawHelper.getRenderablesFor = function(component) {
		var meshes;
		if(component.type === 'LightComponent') {
			meshes = lightDebug.getMesh(component.light);
		} else if (component.type === 'CameraComponent') {
			meshes = cameraDebug.getMesh(component.camera);
		} else if (component.type === 'MeshRendererComponent') {
			return;
			// Not done yet
		}
		var material = Material.createMaterial(ShaderLib.simpleColored, 'DebugDrawMaterial');
		return [
		 {
			 meshData: meshes[0],
			 transform: new Transform(),
			 materials: [material]
		 },
		 {
			 meshData: meshes[1],
			 transform: new Transform(),
			 materials: [material]
		 }
		];
	};

	DebugDrawHelper.update = function(renderables, component, scale) {
		if(component.camera && component.camera.changedProperties) {
			var camera = component.camera;
			if((camera.far / camera.near) !== renderables[1].farNear) {
				renderables[1].meshData = CameraDebug.buildFrustum(camera.far / camera.near);
				renderables[1].farNear = camera.far / camera.near;
			}
			component.camera.changedProperties = false;
		}
		DebugDrawHelper[component.type].updateMaterial(renderables[0].materials[0], component);
		DebugDrawHelper[component.type].updateTransform(renderables[1].transform, component, scale);

		renderables[0].transform.scale.scale(scale);
		renderables[0].transform.update();
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

	DebugDrawHelper.LightComponent.updateTransform = function(transform, component, scale) {
		var light = component.light;
		if (!(light instanceof DirectionalLight)) {
			var r = light.range;
			transform.scale.setd(r,r,r);
			if (light instanceof SpotLight) {
				var angle = light.angle * Math.PI / 180;
				var tan = Math.tan(angle / 2);
				transform.scale.muld(tan, tan, 1);
			}
		} else {
			transform.scale.scale(scale);
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