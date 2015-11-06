define([
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Camera',
	'goo/math/Plane',
	'goo/renderer/pass/RenderTarget',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/renderer/Material',
	'goo/renderer/Texture',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/renderer/shaders/ShaderFragment'
], function (
	MeshData,
	Shader,
	Camera,
	Plane,
	RenderTarget,
	Vector3,
	Vector4,
	Material,
	Texture,
	TextureCreator,
	ShaderBuilder,
	ShaderFragment
) {
	'use strict';

	/**
	 * Handles pre-rendering of water planes. Attach this to the rendersystem pre-renderers.
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Water/water-vtest.html Working example
	 * @param {Object} [settings] Water settings passed in a JSON object
	 * @param {boolean} [settings.useRefraction=true] Render refraction in water
	 * @param {boolean} [settings.divider=2] Resolution divider for reflection/refraction
	 * @param {boolean} [settings.normalsUrl] Url to texture to use as normalmap
	 * @param {boolean} [settings.normalsTexture] Texture instance to use as normalmap
	 * @param {boolean} [settings.updateWaterPlaneFromEntity=true] Use water entity y for water plane position
	 */
	function FlatWaterRenderer(settings) {
		settings = settings || {};

		this.useRefraction = settings.useRefraction !== undefined ? settings.useRefraction : true;

		this.waterCamera = new Camera(45, 1, 0.1, 2000);
		this.renderList = [];

		this.waterPlane = new Plane();

		var width = Math.floor(window.innerWidth / (settings.divider || 2));
		var height = Math.floor(window.innerHeight / (settings.divider || 2));

		this.reflectionTarget = new RenderTarget(width, height);
		if (this.useRefraction) {
			this.refractionTarget = new RenderTarget(width, height);
			this.depthTarget = new RenderTarget(width, height);
		}

		var waterMaterial = new Material(waterShaderDef, 'WaterMaterial');
		waterMaterial.shader.setDefine('REFRACTION', this.useRefraction);
		waterMaterial.cullState.enabled = false;

		var texture = null;
		if (settings.normalsTexture) {
			texture = settings.normalsTexture;
			waterMaterial.setTexture('NORMAL_MAP', texture);
		} else if (settings.normalsUrl) {
			var normalsTextureUrl = settings.normalsUrl || '../resources/water/waternormals3.png';
			new TextureCreator().loadTexture2D(normalsTextureUrl).then(function (texture) {
				waterMaterial.setTexture('NORMAL_MAP', texture);
			});
		} else {
			var flatNormalData = new Uint8Array([127, 127, 255, 255]);
			texture = new Texture(flatNormalData, null, 1, 1);
			waterMaterial.setTexture('NORMAL_MAP', texture);
		}
		this.waterMaterial = waterMaterial;

		this.skybox = null;
		this.followCam = true;
		this.updateWaterPlaneFromEntity = settings.updateWaterPlaneFromEntity !== undefined ? this.updateWaterPlaneFromEntity : true;

		this.calcVect = new Vector3();
		this.camReflectDir = new Vector3();
		this.camReflectUp = new Vector3();
		this.camReflectLeft = new Vector3();
		this.camLocation = new Vector3();
		this.camReflectPos = new Vector3();

		this.offset = new Vector3();
		this.clipPlane = new Vector4();

		this.waterEntity = null;

		this.depthMaterial = new Material(packDepthY, 'depth');
	}

	FlatWaterRenderer.prototype.process = function (renderer, entities, partitioner, camera, lights) {
		if (!this.waterEntity) {
			return;
		}

		entities = entities.filter(function (entity) {
			return entity.meshRendererComponent.isReflectable;
		});

		var waterPlane = this.waterPlane;

		this.waterCamera.copy(camera);
		if (this.updateWaterPlaneFromEntity) {
			waterPlane.constant = this.waterEntity.transformComponent.worldTransform.translation.y;
		}
		var aboveWater = camera.translation.y > waterPlane.constant;

		this.waterEntity.skip = true;

		if (aboveWater) {
			if (this.useRefraction) {
				partitioner.process(this.waterCamera, entities, this.renderList);

				this.clipPlane.setDirect(waterPlane.normal.x, -waterPlane.normal.y, waterPlane.normal.z, -waterPlane.constant);
				this.waterCamera.setToObliqueMatrix(this.clipPlane);

				this.depthMaterial.uniforms.waterHeight = waterPlane.constant;
				renderer.render(this.renderList, this.waterCamera, lights, this.depthTarget, true, this.depthMaterial);

				renderer.render(this.renderList, this.waterCamera, lights, this.refractionTarget, true);

				if (!this.waterMaterial.getTexture('REFRACTION_MAP')) {
					this.waterMaterial.setTexture('REFRACTION_MAP', this.refractionTarget);
					this.waterMaterial.setTexture('DEPTH_MAP', this.depthTarget);
				}
			}

			var calcVect = this.calcVect;
			var camReflectDir = this.camReflectDir;
			var camReflectUp = this.camReflectUp;
			var camReflectLeft = this.camReflectLeft;
			var camLocation = this.camLocation;
			var camReflectPos = this.camReflectPos;

			camLocation.set(camera.translation);
			var planeDistance = waterPlane.pseudoDistance(camLocation) * 2.0;
			calcVect.set(waterPlane.normal).mulDirect(planeDistance, planeDistance, planeDistance);
			camReflectPos.set(camLocation.sub(calcVect));

			camLocation.set(camera.translation).add(camera._direction);
			planeDistance = waterPlane.pseudoDistance(camLocation) * 2.0;
			calcVect.set(waterPlane.normal).mulDirect(planeDistance, planeDistance, planeDistance);
			camReflectDir.set(camLocation.sub(calcVect)).sub(camReflectPos).normalize();

			camLocation.set(camera.translation).add(camera._up);
			planeDistance = waterPlane.pseudoDistance(camLocation) * 2.0;
			calcVect.set(waterPlane.normal).mulDirect(planeDistance, planeDistance, planeDistance);
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
				target.translation.set(camReflectPos);
				target.update();
			}
		}

		this.waterMaterial.shader.uniforms.abovewater = aboveWater;

		partitioner.process(this.waterCamera, entities, this.renderList);

		renderer.setRenderTarget(this.reflectionTarget);
		renderer.clear();

		if (this.skybox) {
			if (this.skybox instanceof Array) {
				this.clipPlane.setDirect(waterPlane.normal.x, waterPlane.normal.y, waterPlane.normal.z, waterPlane.constant);
				this.waterCamera.setToObliqueMatrix(this.clipPlane, 10.0);
				for (var i = 0; i < this.skybox.length; i++) {
					renderer.render(this.skybox[i], this.waterCamera, lights, this.reflectionTarget, false);
					this.skybox[i].skip = true;
				}
			} else {
				renderer.render(this.skybox, this.waterCamera, lights, this.reflectionTarget, false);
				this.skybox.skip = true;
			}
		}

		this.clipPlane.setDirect(waterPlane.normal.x, waterPlane.normal.y, waterPlane.normal.z, waterPlane.constant);
		this.waterCamera.setToObliqueMatrix(this.clipPlane);

		renderer.render(this.renderList, this.waterCamera, lights, this.reflectionTarget, false);

		this.waterEntity.skip = false;
		if (this.skybox) {
			if (this.skybox instanceof Array) {
				for (var i = 0; i < this.skybox.length; i++) {
					this.skybox[i].skip = false;
				}
			} else {
				this.skybox.skip = false;
			}
		}

		if (!this.waterMaterial.getTexture('REFLECTION_MAP')) {
			this.waterMaterial.setTexture('REFLECTION_MAP', this.reflectionTarget);
		}

		if (aboveWater && this.skybox && this.followCam) {
			var source = camera.translation;
			var target = this.skybox.transformComponent.worldTransform;
			target.translation.set(source).add(this.offset);
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
			normalMatrix: Shader.NORMAL_MATRIX,
			cameraPosition: Shader.CAMERA,

			normalMap: 'NORMAL_MAP',
			reflection: 'REFLECTION_MAP',
			refraction: 'REFRACTION_MAP',
			depthmap: 'DEPTH_MAP',

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
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec3 vertexNormal;',

			'uniform vec4 vertexTangent;',
			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform mat3 normalMatrix;',
			'uniform vec3 cameraPosition;',
			'uniform float waterScale;',

			'varying vec2 texCoord0;',
			'varying vec3 eyeVec;',
			'varying vec4 viewCoords;',
			'varying vec3 worldPos;',

			'void main(void) {',
				'worldPos = (worldMatrix * vec4(vertexPosition, 1.0)).xyz;',

				'texCoord0 = worldPos.xz * waterScale;',

				'vec3 n = normalize(normalMatrix * vec3(vertexNormal.x, vertexNormal.y, -vertexNormal.z));',
				'vec3 t = normalize(normalMatrix * vertexTangent.xyz);',
				'vec3 b = cross(n, t) * vertexTangent.w;',
				'mat3 rotMat = mat3(t, b, n);',

				'vec3 eyeDir = worldPos - cameraPosition;',
				'eyeVec = eyeDir * rotMat;',

				'viewCoords = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
				'gl_Position = viewCoords;',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D normalMap;',
			'uniform sampler2D reflection;',
			'#ifdef REFRACTION',
			'uniform sampler2D refraction;',
			'uniform sampler2D depthmap;',
			'#endif',

			'uniform vec3 waterColor;',
			'uniform bool abovewater;',
			'uniform vec3 fogColor;',
			'uniform float fogStart;',
			'uniform float fogScale;',
			'uniform float time;',
			'uniform float timeMultiplier;',
			'uniform float distortionMultiplier;',
			'uniform float fresnelPow;',
			'uniform vec3 sunDirection;',
			'uniform vec3 sunColor;',
			'uniform float sunShininess;',
			'uniform float sunSpecPower;',
			'uniform float normalMultiplier;',
			'uniform float fresnelMultiplier;',
			'uniform bool doFog;',
			'uniform vec2 resolution;',

			'varying vec2 texCoord0;',
			'varying vec3 eyeVec;',
			'varying vec4 viewCoords;',
			'varying vec3 worldPos;',

			'vec4 combineTurbulence(in vec2 coords) {',
				'float t = time * timeMultiplier;',
				'vec4 coarse1 = texture2D(normalMap, coords * vec2(0.0012, 0.001) + vec2(0.019 * t, 0.021 * t));',
				'vec4 coarse2 = texture2D(normalMap, coords * vec2(0.001, 0.0011) + vec2(-0.017 * t, 0.016 * t));',
				'vec4 detail1 = texture2D(normalMap, coords * vec2(0.008) + vec2(0.06 * t, 0.03 * t));',
				'vec4 detail2 = texture2D(normalMap, coords * vec2(0.006) + vec2(0.05 * t, -0.04 * t));',
				'return (detail1 * 0.25 + detail2 * 0.25 + coarse1 * 0.75 + coarse2 * 1.0) / 2.25 - 0.48;',
			'}',

			'#ifdef REFRACTION',
			ShaderFragment.methods.unpackDepth,
			'#endif',

			'void main(void) {',
				'float fogDist = clamp((viewCoords.z-fogStart)/fogScale,0.0,1.0);',

				'vec2 normCoords = texCoord0;',
				'vec4 noise = combineTurbulence(normCoords);',
				'vec3 normalVector = normalize(noise.xyz * vec3(normalMultiplier, normalMultiplier, 1.0));',

				'vec3 localView = normalize(eyeVec);',
				'float fresnel = dot(normalize(normalVector * vec3(fresnelMultiplier, fresnelMultiplier, 1.0)), localView);',
				'if ( abovewater == false ) {',
				'	fresnel = -fresnel;',
				'}',
				'fresnel *= 1.0 - fogDist;',
				'float fresnelTerm = 1.0 - fresnel;',
				'fresnelTerm = pow(fresnelTerm, fresnelPow);',
				'fresnelTerm = clamp(fresnelTerm, 0.0, 1.0);',
				'fresnelTerm = fresnelTerm * 0.95 + 0.05;',

				'vec2 projCoord = viewCoords.xy / viewCoords.q;',
				'projCoord = (projCoord + 1.0) * 0.5;',
				'projCoord.y -= 1.0 / resolution.y;',

				'#ifdef REFRACTION',
					'float depth = unpackDepth(texture2D(depthmap, projCoord));',
					'vec2 projCoordRefr = projCoord;',
					'projCoordRefr += (normalVector.xy * distortionMultiplier) * smoothstep(0.0, 0.5, depth);',
					'projCoordRefr = clamp(projCoordRefr, 0.001, 0.999);',
					'depth = unpackDepth(texture2D(depthmap, projCoordRefr));',
				'#endif',

				'projCoord += (normalVector.xy * distortionMultiplier);',
				'projCoord = clamp(projCoord, 0.001, 0.999);',

				'if ( abovewater == true ) {',
					'projCoord.x = 1.0 - projCoord.x;',
				'}',

				'vec4 waterColorX = vec4(waterColor, 1.0);',

				'vec4 reflectionColor = texture2D(reflection, projCoord);',
				'if ( abovewater == false ) {',
					'reflectionColor *= vec4(0.8,0.9,1.0,1.0);',
					'vec4 endColor = mix(reflectionColor,waterColorX,fresnelTerm);',
					'gl_FragColor = mix(endColor,waterColorX,fogDist);',
				'}',
				'else {',
					'vec3 sunSpecReflection = normalize(reflect(-sunDirection, normalVector));',
					'float sunSpecDirection = max(0.0, dot(localView, sunSpecReflection));',
					'vec3 specular = pow(sunSpecDirection, sunShininess) * sunSpecPower * sunColor;',

					'vec4 endColor = waterColorX;',
					'#ifdef REFRACTION',
						'vec4 refractionColor = texture2D(refraction, projCoordRefr) * vec4(0.7);',
						'endColor = mix(refractionColor, waterColorX, depth);',
					'#endif',
					'endColor = mix(endColor, reflectionColor, fresnelTerm);',

					'if (doFog) {',
						'gl_FragColor = (vec4(specular, 1.0) + mix(endColor,reflectionColor,fogDist)) * (1.0-fogDist) + vec4(fogColor, 1.0) * fogDist;',
					'} else {',
						'gl_FragColor = vec4(specular, 1.0) + mix(endColor,reflectionColor,fogDist);',
					'}',
				'}',
			'}'
		].join('\n')
	};

	var packDepthY = {
		processors: [
			ShaderBuilder.animation.processor
		],
		defines: {
			WEIGHTS: true,
			JOINTIDS: true
		},
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexJointIDs: MeshData.JOINTIDS,
			vertexWeights: MeshData.WEIGHTS
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			waterHeight: 0,
			waterDensity: 0.05
		},
		vshader: [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec4 worldPosition;',

			ShaderBuilder.animation.prevertex,

			'void main(void) {',
				'mat4 wMatrix = worldMatrix;',
				ShaderBuilder.animation.vertex,
				'worldPosition = wMatrix * vec4(vertexPosition, 1.0);',
				'gl_Position = projectionMatrix * viewMatrix * worldPosition;',
			'}'
		].join('\n'),
		fshader: [
			'uniform float waterHeight;',
			'uniform float waterDensity;',

			ShaderFragment.methods.packDepth,

			'varying vec4 worldPosition;',

			'void main(void)',
			'{',
				'float linearDepth = clamp(pow((waterHeight - worldPosition.y) * waterDensity, 0.25), 0.0, 0.999);',
				'gl_FragColor = packDepth(linearDepth);',
			'}'
		].join('\n')
	};

	return FlatWaterRenderer;
});