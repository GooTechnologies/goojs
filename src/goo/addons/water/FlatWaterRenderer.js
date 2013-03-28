define([
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Camera',
	'goo/math/Plane',
	'goo/renderer/pass/RenderTarget',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/renderer/Material',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/EventHandler',
	'goo/renderer/shaders/ShaderFragments'
],
/** @lends FlatWaterRenderer */
function (
	MeshData,
	Shader,
	Camera,
	Plane,
	RenderTarget,
	Vector3,
	Vector4,
	Material,
	TextureCreator,
	ShaderLib,
	EventHandler,
	ShaderFragments
) {
	"use strict";

	/**
	 * @class Handles pre-rendering of water planes. Attach this to the rendersystem pre-renderers.
	 * @param {ArrayBuffer} data Data to wrap
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function FlatWaterRenderer (camera, settings) {
		this.camera = camera;
		settings = settings || {};

		this.useRefraction = settings.useRefraction !== undefined ? settings.useRefraction : true;

		this.waterCamera = new Camera(45, 1, 0.1, 2000);
		this.renderList = [];

		this.waterPlane = new Plane();

		var width = window.innerWidth / (settings.divider || 2);
		var height = window.innerHeight / (settings.divider || 2);
		this.reflectionTarget = new RenderTarget(width, height);
		if (this.useRefraction) {
			this.refractionTarget = new RenderTarget(width, height);
			this.depthTarget = new RenderTarget(width, height);
		}

		var waterMaterial = Material.createMaterial(waterShaderDef, 'WaterMaterial');
		waterMaterial.shader.defines.REFRACTION = this.useRefraction;
		waterMaterial.cullState.enabled = false;
		var normalsTextureUrl = settings.normalsUrl || '../resources/water/waternormals3.png';
		waterMaterial.textures[0] = new TextureCreator().loadTexture2D(normalsTextureUrl);
		waterMaterial.textures[1] = this.reflectionTarget;
		if (this.useRefraction) {
			waterMaterial.textures[2] = this.refractionTarget;
			waterMaterial.textures[3] = this.depthTarget;
		}
		this.waterMaterial = waterMaterial;

		this.followCam = true;

		this.calcVect = new Vector3();
		this.camReflectDir = new Vector3();
		this.camReflectUp = new Vector3();
		this.camReflectLeft = new Vector3();
		this.camLocation = new Vector3();
		this.camReflectPos = new Vector3();

		this.offset = new Vector3();
		this.clipPlane = new Vector4();

		this.waterEntity = null;

		this.depthMaterial = Material.createMaterial(packDepthY, 'depth');

		var that = this;
		this.camera = null;
		this.lights = [];
		EventHandler.addListener({
			setCurrentCamera : function (camera) {
				that.camera = camera;
			},
			setLights : function (lights) {
				that.lights = lights;
			}
		});
	}

	FlatWaterRenderer.prototype.process = function (renderer, entities, partitioner) {
		var camera = this.camera;
		var waterPlane = this.waterPlane;

		this.waterCamera.copy(camera);
		waterPlane.constant = this.waterEntity.transformComponent.transform.translation.y;
		var aboveWater = camera.translation.y > waterPlane.constant;

		this.waterEntity.skip = true;

		if (aboveWater) {
			if (this.useRefraction) {
				partitioner.process(this.waterCamera, entities, this.renderList);

				this.clipPlane.setd(waterPlane.normal.x, -waterPlane.normal.y, waterPlane.normal.z, waterPlane.constant);
				this.waterCamera.setToObliqueMatrix(this.clipPlane);

				renderer.overrideMaterial = this.depthMaterial;
				renderer.render(this.renderList, this.waterCamera, this.lights, this.depthTarget, true);
				renderer.overrideMaterial = null;

				renderer.render(this.renderList, this.waterCamera, this.lights, this.refractionTarget, true);
			}

			var calcVect = this.calcVect;
			var camReflectDir = this.camReflectDir;
			var camReflectUp = this.camReflectUp;
			var camReflectLeft = this.camReflectLeft;
			var camLocation = this.camLocation;
			var camReflectPos = this.camReflectPos;

			camLocation.set(camera.translation);
			var planeDistance = waterPlane.pseudoDistance(camLocation);
			calcVect.set(waterPlane.normal).mul(planeDistance * 2.0);
			camReflectPos.set(camLocation.sub(calcVect));

			camLocation.set(camera.translation).add(camera._direction);
			planeDistance = waterPlane.pseudoDistance(camLocation);
			calcVect.set(waterPlane.normal).mul(planeDistance * 2.0);
			camReflectDir.set(camLocation.sub(calcVect)).sub(camReflectPos).normalize();

			camLocation.set(camera.translation).add(camera._up);
			planeDistance = waterPlane.pseudoDistance(camLocation);
			calcVect.set(waterPlane.normal).mul(planeDistance * 2.0);
			camReflectUp.set(camLocation.sub(calcVect)).sub(camReflectPos).normalize();

			camReflectLeft.set(camReflectUp).cross(camReflectDir).normalize();

			this.waterCamera.translation.set(camReflectPos);
			this.waterCamera._direction.set(camReflectDir);
			this.waterCamera._up.set(camReflectUp);
			this.waterCamera._left.set(camReflectLeft);
			this.waterCamera.normalize();
			this.waterCamera.update();

			if (this.skybox && this.followCam) {
				var target = this.skybox.transformComponent.worldTransform;
				target.translation.setv(camReflectPos);
				target.update();
			}
		}

		this.waterMaterial.shader.uniforms.abovewater = aboveWater;

		partitioner.process(this.waterCamera, entities, this.renderList);

		renderer.setRenderTarget(this.reflectionTarget);
		renderer.clear();

		if (this.skybox) {
			if (this.skybox instanceof Array) {
				this.clipPlane.setd(waterPlane.normal.x, waterPlane.normal.y, waterPlane.normal.z, waterPlane.constant);
				this.waterCamera.setToObliqueMatrix(this.clipPlane, 10.0);
				for (var i=0;i<this.skybox.length;i++) {
					renderer.render(this.skybox[i], this.waterCamera, this.lights, this.reflectionTarget, false);
					this.skybox[i].skip = true;
				}
			} else {
				renderer.render(this.skybox, this.waterCamera, this.lights, this.reflectionTarget, false);
				this.skybox.skip = true;
			}
		}

		this.clipPlane.setd(waterPlane.normal.x, waterPlane.normal.y, waterPlane.normal.z, waterPlane.constant);
		this.waterCamera.setToObliqueMatrix(this.clipPlane);

		renderer.render(this.renderList, this.waterCamera, this.lights, this.reflectionTarget, false);

		this.waterEntity.skip = false;
		if (this.skybox) {
			if (this.skybox instanceof Array) {
				for (var i=0;i<this.skybox.length;i++) {
					this.skybox[i].skip = false;
				}
			} else {
				this.skybox.skip = false;
			}
		}

		if (aboveWater && this.skybox && this.followCam) {
			var source = camera.translation;
			var target = this.skybox.transformComponent.worldTransform;
			target.translation.setv(source).addv(this.offset);
			target.update();
			this.waterCamera._updatePMatrix = true;
		}
	};

	FlatWaterRenderer.prototype.setSkyBox = function (skyboxEntity) {
		this.skybox = skyboxEntity;
		if (skyboxEntity.meshRendererComponent) {
			this.skybox.meshRendererComponent.materials[0].depthState.enabled = false;
			this.skybox.meshRendererComponent.materials[0].renderQueue = 0;
			this.skybox.meshRendererComponent.cullMode = 'Never';
		}
	};

	FlatWaterRenderer.prototype.setWaterEntity = function (entity) {
		this.waterEntity = entity;
		this.waterEntity.meshRendererComponent.materials[0] = this.waterMaterial;
	};

	var waterShaderDef = {
		defines: {
			REFRACTION: false
		},
		// timeMultiplier: 1.0,
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexNormal: MeshData.NORMAL
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraPosition: Shader.CAMERA,

			normalMap: Shader.TEXTURE0,
			reflection: Shader.TEXTURE1,
			refraction: Shader.TEXTURE2,
			depthmap: Shader.TEXTURE3,

			vertexTangent: [
				1, 0, 0, 1
			],
			waterColor: [
				0.0625, 0.0625, 0.0625
			],
			abovewater: true,
			fogColor: [
				1.0, 1.0, 1.0
			],
			sunDirection: [
				0.66, 0.66, 0.33
			],
			sunColor: [
				1.0, 1.0, 0.5
			],
			// reflectionMultiplier: [
				// 1.0, 1.0, 1.0, 1.0
			// ],
			sunShininess: 100.0,
			sunSpecPower: 4.0,
			fogStart: 0.0,
			fogScale: 2000.0,
			timeMultiplier: 1.0,
			time: Shader.TIME,
			distortionMultiplier: 0.025,
			fresnelPow: 2.0,
			normalMultiplier: 3.0,
			fresnelMultiplier: 1.0,
			waterScale: 5.0,
			doFog: true,
			resolution: Shader.RESOLUTION
		},
		vshader: [ //
			'attribute vec3 vertexPosition;', //
			'attribute vec3 vertexNormal;', //

			'uniform vec4 vertexTangent;', //
			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//
			'uniform vec3 cameraPosition;', //
			'uniform float waterScale;',

			'varying vec2 texCoord0;',//
			'varying vec3 eyeVec;',//
			'varying vec4 viewCoords;',
			'varying vec3 worldPos;',

			'void main(void) {', //
			'	worldPos = (worldMatrix * vec4(vertexPosition, 1.0)).xyz;',

			'	texCoord0 = worldPos.xz * waterScale;',//

			'	mat3 normalMatrix = mat3(worldMatrix);',

			'	vec3 n = normalize(normalMatrix * vec3(vertexNormal.x, vertexNormal.y, -vertexNormal.z));',
			'	vec3 t = normalize(normalMatrix * vertexTangent.xyz);',
			'	vec3 b = cross(n, t) * vertexTangent.w;',
			'	mat3 rotMat = mat3(t, b, n);',

			'	vec3 eyeDir = worldPos - cameraPosition;',
			'	eyeVec = eyeDir * rotMat;',

			'	viewCoords = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
			'	gl_Position = viewCoords;',
			'}'//
		].join('\n'),
		fshader: [//
			'precision highp float;',//
			// 'precision mediump float;',//

			'uniform sampler2D normalMap;',//
			'uniform sampler2D reflection;',//
			'#ifdef REFRACTION',
			'uniform sampler2D refraction;',//
			'uniform sampler2D depthmap;',//
			'#endif',

			'uniform vec3 waterColor;',
			'uniform bool abovewater;',
			'uniform vec3 fogColor;',
			'uniform float fogStart;',
			'uniform float fogScale;',
			'uniform vec3 sunDirection;',
			'uniform float time;',
			'uniform float timeMultiplier;',
			'uniform float distortionMultiplier;',
			'uniform float fresnelPow;',
			'uniform vec3 sunColor;',
			'uniform float sunShininess;',
			'uniform float sunSpecPower;',
			'uniform float normalMultiplier;',
			'uniform float fresnelMultiplier;',
			'uniform bool doFog;',
			// 'uniform vec4 reflectionMultiplier;',
			'uniform vec2 resolution;',

			'varying vec2 texCoord0;',//
			'varying vec3 eyeVec;',//
			'varying vec4 viewCoords;',
			'varying vec3 worldPos;',

			'vec4 getNoise(vec2 uv) {',
			'	float t = time * timeMultiplier;',
			'    vec2 uv0 = (uv/vec2(123.0)) + vec2(t/17.0, t/29.0);',
			'    vec2 uv1 = (uv/vec2(167.0)) - vec2(t/-19.0, t/31.0);',
			'    vec2 uv2 = uv/vec2(827.0, 983.0) + vec2(t/51.0, t/47.0);',
			'    vec2 uv3 = uv/vec2(991.0, 877.0) - vec2(t/59.0, t/-63.0);',
			'    vec4 noise = (texture2D(normalMap, uv0)) +',
			'                 (texture2D(normalMap, uv1)) +',
			'                 (texture2D(normalMap, uv2)*3.0) +',
			'                 (texture2D(normalMap, uv3)*4.0);',
			'    return noise/9.0-0.48;',
			'}',

			'void sunLight(const vec3 surfaceNormal, const vec3 eyeDirection, const float shiny, const float spec, inout vec3 specularColor){',
			'    vec3 reflection = normalize(reflect(-sunDirection, surfaceNormal));',
			'    float direction = max(0.0, dot(normalize(eyeDirection), reflection));',
			'    specularColor += pow(direction, shiny) * spec * sunColor;',
			'}',

			ShaderFragments.methods.unpackDepth,//

			'void main(void)',//
			'{',//
			'	float fogDist = clamp((viewCoords.z-fogStart)/fogScale,0.0,1.0);',

			'	vec2 normCoords = texCoord0;',
			'	vec4 noise = getNoise(normCoords);',
			'	vec3 normalVector = normalize(noise.xyz * vec3(normalMultiplier, normalMultiplier, 1.0));',

			'	vec3 localView = normalize(eyeVec);',
			'	float fresnel = dot(normalize(normalVector * vec3(fresnelMultiplier, fresnelMultiplier, 1.0)), localView);',
			'	if ( abovewater == false ) {',
			'		fresnel = -fresnel;',
			'	}',
			'	fresnel *= 1.0 - fogDist;',
			'	float fresnelTerm = 1.0 - fresnel;',
			'	fresnelTerm = pow(fresnelTerm, fresnelPow);',
			'	fresnelTerm = clamp(fresnelTerm, 0.0, 1.0);',
			'	fresnelTerm = fresnelTerm * 0.95 + 0.05;',

			'	vec2 projCoord = viewCoords.xy / viewCoords.q;',
			'	projCoord = (projCoord + 1.0) * 0.5;',
			'	projCoord.y -= 1.0 / resolution.y;',

			'#ifdef REFRACTION',
			'	float depthUnpack = unpackDepth(texture2D(depthmap, projCoord));',
			'	if (depthUnpack > 0.5) {depthUnpack = 0.0;}',
			'	float depth2 = clamp(depthUnpack * 400.0, 0.0, 1.0);',
			'	vec2 projCoordRefr = vec2(projCoord);',
			'	projCoordRefr += (normalVector.xy * distortionMultiplier) * (depth2);',
			'	projCoordRefr = clamp(projCoordRefr, 0.001, 0.999);',
			'	depthUnpack = unpackDepth(texture2D(depthmap, projCoordRefr));',
			'	float depth = clamp(depthUnpack * 40.0, 0.8, 1.0);',
			'#else',
			// '	projCoord += (normalVector.xy * distortionMultiplier);',
			'#endif',


			'	projCoord += (normalVector.xy * distortionMultiplier);',
			'	projCoord = clamp(projCoord, 0.001, 0.999);',
			// '	vec2 projCoordRefr = projCoord;',

			'	if ( abovewater == true ) {',
			'		projCoord.x = 1.0 - projCoord.x;',
			'	}',

			'	vec4 waterColorX = vec4(waterColor, 1.0);',

			'	vec4 reflectionColor = texture2D(reflection, projCoord);',
			'	if ( abovewater == false ) {',
			'		reflectionColor *= vec4(0.8,0.9,1.0,1.0);',
			'		vec4 endColor = mix(reflectionColor,waterColorX,fresnelTerm);',
			'		gl_FragColor = mix(endColor,waterColorX,fogDist);',
			'	}',
			'	else {',
			// '		vec3 diffuse = vec3(0.0);',
			'		vec3 specular = vec3(0.0);',
			// '	    sunLight(normalVector, localView, sunShininess, sunSpecPower, sunDiffusePower, diffuse, specular);',
			'	    sunLight(normalVector, localView, sunShininess, sunSpecPower, specular);',
			// '		reflectionColor *= reflectionMultiplier;',

			'		vec4 endColor = waterColorX;',
			'#ifdef REFRACTION',
			// '		float depthUnpack = unpackDepth(texture2D(depthmap, projCoordRefr));',
			// '		float depth = clamp(depthUnpack * 120.0, 0.0, 1.0);',
			'		vec4 refractionColor = texture2D(refraction, projCoordRefr) * vec4(0.6);',
			'		endColor = mix(refractionColor, waterColorX, depth);',
			'#endif',

			'		endColor = mix(endColor, reflectionColor, fresnelTerm);',

			'		if (doFog) {',
			'			gl_FragColor = (vec4(specular, 1.0) + mix(endColor,reflectionColor,fogDist)) * (1.0-fogDist) + vec4(fogColor, 1.0) * fogDist;',
			'		} else {',
			'			gl_FragColor = vec4(specular, 1.0) + mix(endColor,reflectionColor,fogDist);',
			'		}',
			// '		gl_FragColor = vec4(waterColor, 1.0);',
			'	}',
			'}'
		].join('\n')
	};

	var packDepthY = {
		attributes : {
			vertexPosition : MeshData.POSITION
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			farPlane : Shader.FAR_PLANE
		},
		vshader : [ //
			'attribute vec3 vertexPosition;', //

			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',//

			'varying vec4 vPosition;',//

			'void main(void) {', //
			'	vPosition = worldMatrix * vec4(vertexPosition, 1.0);', //
			'	gl_Position = viewProjectionMatrix * vPosition;', //
			'}'//
		].join('\n'),
		fshader : [//
			'precision highp float;',//

			'uniform float farPlane;',//

			ShaderFragments.methods.packDepth,//

			'varying vec4 vPosition;',//

			'void main(void)',//
			'{',//
			// '	float linearDepth = -vPosition.y / farPlane;',//
			'	float linearDepth = abs(vPosition.y) / farPlane;',//
			'	gl_FragColor = packDepth(linearDepth);',//
			'}'//
		].join('\n')
	};

	return FlatWaterRenderer;
});