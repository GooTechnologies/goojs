goo.FlatWaterRenderer = (function (
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
		this.divider = settings.divider || 2;

		this.width = -1;
		this.height = -1;

		this.waterCamera = new Camera(45, 1, 0.1, 2000);
		this.renderList = [];

		this.waterPlane = new Plane();

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

	FlatWaterRenderer.prototype.updateSize = function (renderer) {
		var width = Math.floor(renderer.viewportWidth / this.divider);
		var height = Math.floor(renderer.viewportHeight / this.divider);
		if (width === this.width && height === this.height) {
			return;			
		}
		this.width = width;
		this.height = height;

		if (this.reflectionTarget) {
			renderer._deallocateRenderTarget(this.reflectionTarget);
		}
		this.reflectionTarget = new RenderTarget(width, height);

		if (this.useRefraction) {
			if (this.refractionTarget) {
				renderer._deallocateRenderTarget(this.refractionTarget);
			}
			if (this.depthTarget) {
				renderer._deallocateRenderTarget(this.depthTarget);
			}
			this.refractionTarget = new RenderTarget(width, height);
			this.depthTarget = new RenderTarget(width, height);
		}
	};

	FlatWaterRenderer.prototype.process = function (renderer, entities, partitioner, camera, lights) {
		if (!this.waterEntity) {
			return;
		}

		this.updateSize(renderer);

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

				this.waterMaterial.setTexture('REFRACTION_MAP', this.refractionTarget);
				this.waterMaterial.setTexture('DEPTH_MAP', this.depthTarget);
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

		this.waterMaterial.setTexture('REFLECTION_MAP', this.reflectionTarget);

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
})(goo.MeshData,goo.Shader,goo.Camera,goo.Plane,goo.RenderTarget,goo.Vector3,goo.Vector4,goo.Material,goo.Texture,goo.TextureCreator,goo.ShaderBuilder,goo.ShaderFragment);
goo.ProjectedGrid = (function (
	MeshData,
	Vector2,
	Vector3,
	Vector4,
	Matrix4,
	Camera,
	MathUtils
) {
	'use strict';

	/**
	 * Projected grid mesh
	 * @param {number} [densityX=20] Density in X of grid
	 * @param {number} [densityY=20] Density in Y of grid
	 */
	function ProjectedGrid(densityX, densityY) {
		this.densityX = densityX !== undefined ? densityX : 20;
		this.densityY = densityY !== undefined ? densityY : 20;

		this.projectorCamera = new Camera(45, 1, 0.1, 2000);
		this.mainCamera = new Camera(45, 1, 0.1, 2000);

		this.freezeProjector = false;
		this.upperBound = 20.0;

		this.origin = new Vector4();
		this.direction = new Vector4();
		this.source = new Vector2();
		this.rangeMatrix = new Matrix4();

		this.intersectBottomLeft = new Vector4();
		this.intersectTopLeft = new Vector4();
		this.intersectTopRight = new Vector4();
		this.intersectBottomRight = new Vector4();

		this.planeIntersection = new Vector3();

		this.freezeProjector = false;

		this.projectorMinHeight = 50.0;
		this.intersections = [];
		for (var i = 0; i < 24; i++) {
			this.intersections.push(new Vector3());
		}

		this.connections = [0, 3, 1, 2, 0, 4, 1, 5, 2, 6, 3, 7, 4, 7, 5, 6];

		// Create mesh data
		var vertexCount = this.densityX * this.densityY;
		var indexCount = ((this.densityX - 1) * (this.densityY - 1)) * 6;
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.TEXCOORD0]);
		MeshData.call(this, attributeMap, vertexCount, indexCount);

		this.rebuild();
	}

	ProjectedGrid.prototype = Object.create(MeshData.prototype);
	ProjectedGrid.prototype.constructor = ProjectedGrid;

	ProjectedGrid.prototype.update = function (camera) {
		if (camera.translation.y === 0) {
			return;
		}

		var upperBound = this.upperBound;
		var mainCamera = this.mainCamera;

		if (!mainCamera) {
			return;
		}

		if (!this.freezeProjector) {
			mainCamera.copy(camera);
			// mainCamera.setFrustumPerspective(null, null, 10.0, 300.0);

			// var tmp = new Vector3();
			// getWorldTransform().applyInverse(mainCamera.translation, tmp);
			// mainCamera.setLocation(tmp);
			// getWorldTransform().applyInverseVector(mainCamera.getLeft(), tmp);
			// mainCamera.setLeft(tmp);
			// getWorldTransform().applyInverseVector(mainCamera.getUp(), tmp);
			// mainCamera.setUp(tmp);
			// getWorldTransform().applyInverseVector(mainCamera._direction, tmp);
			// mainCamera.setDirection(tmp);
		}

		var mainCameraLocation = mainCamera.translation;
		if (mainCameraLocation.y > 0.0 && mainCameraLocation.y < upperBound + mainCamera.near) {
			mainCamera.translation.setDirect(mainCameraLocation.x, upperBound + mainCamera.near,
				mainCameraLocation.z);
		} else if (mainCameraLocation.y < 0.0
			&& mainCameraLocation.y > -upperBound - mainCamera.near) {
			mainCamera.translation.setDirect(mainCameraLocation.x, -upperBound - mainCamera.near,
				mainCameraLocation.z);
		}
		var corners = mainCamera.calculateFrustumCorners();

		var nrPoints = 0;

		// check intersections of frustum connections with upper and lower bound
		var tmpStorage = new Vector3();
		for (var i = 0; i < 8; i++) {
			var source = this.connections[i * 2];
			var destination = this.connections[i * 2 + 1];

			if (corners[source].y > upperBound && corners[destination].y < upperBound
				|| corners[source].y < upperBound && corners[destination].y > upperBound) {
				this.getWorldIntersectionSimple(upperBound, corners[source], corners[destination], this.intersections[nrPoints++],
					tmpStorage);
			}
			if (corners[source].y > -upperBound && corners[destination].y < -upperBound
				|| corners[source].y < -upperBound && corners[destination].y > -upperBound) {
				this.getWorldIntersectionSimple(-upperBound, corners[source], corners[destination], this.intersections[nrPoints++],
					tmpStorage);
			}
		}
		// check if any of the frustums corner vertices lie between the upper and lower bound planes
		for (var i = 0; i < 8; i++) {
			if (corners[i].y < upperBound && corners[i].y > -upperBound) {
				this.intersections[nrPoints++].set(corners[i]);
			}
		}

		if (nrPoints === 0) {
			// No intersection, grid not visible
			return false;
		}

		// set projector
		var projectorCamera = this.projectorCamera;
		projectorCamera.copy(mainCamera);

		// force the projector to point at the plane
		if (projectorCamera.translation.y > 0.0 && projectorCamera._direction.y > 0.0
			|| projectorCamera.translation.y < 0.0 && projectorCamera._direction.y < 0.0) {
			projectorCamera._direction.y = -projectorCamera._direction.y;

			var tmpVec = new Vector3();
			tmpVec.set(projectorCamera._direction).cross(projectorCamera._left).normalize();
			projectorCamera._up.set(tmpVec);
		}

		// find the plane intersection point
		var source = this.source;
		var planeIntersection = this.planeIntersection;

		source.setDirect(0.5, 0.5);
		this.getWorldIntersection(0.0, source, projectorCamera.getViewProjectionInverseMatrix(), planeIntersection);

		// force the projector to be a certain distance above the plane
		var cameraLocation = projectorCamera.translation;
		if (cameraLocation.y > 0.0 && cameraLocation.y < this.projectorMinHeight * 2) {
			var delta = (this.projectorMinHeight * 2 - cameraLocation.y) / (this.projectorMinHeight * 2);

			projectorCamera.translation.setDirect(cameraLocation.x, this.projectorMinHeight * 2 - this.projectorMinHeight * delta,
				cameraLocation.z);
		} else if (cameraLocation.y < 0.0 && cameraLocation.y > -this.projectorMinHeight * 2) {
			var delta = (-this.projectorMinHeight * 2 - cameraLocation.y) / (-this.projectorMinHeight * 2);

			projectorCamera.translation.setDirect(cameraLocation.x, -this.projectorMinHeight * 2 + this.projectorMinHeight * delta,
				cameraLocation.z);
		}

		// restrict the intersection point to be a certain distance from the camera in plane coords
		planeIntersection.sub(projectorCamera.translation);
		planeIntersection.y = 0.0;
		var length = planeIntersection.length();
		if (length > Math.abs(projectorCamera.translation.y)) {
			planeIntersection.normalize();
			planeIntersection.scale(Math.abs(projectorCamera.translation.y));
		} else if (length < MathUtils.EPSILON) {
			planeIntersection.add(projectorCamera._up);
			planeIntersection.y = 0.0;
			planeIntersection.normalize();
			planeIntersection.scale(0.1); // TODO: magic number
		}
		planeIntersection.add(projectorCamera.translation);
		planeIntersection.y = 0.0;

		// point projector at the new intersection point
		projectorCamera.lookAt(planeIntersection, Vector3.UNIT_Y);

		// transform points to projector space
		var modelViewProjectionMatrix = projectorCamera.getViewProjectionMatrix();
		var spaceTransformation = new Vector4();
		var intersections = this.intersections;
		for (var i = 0; i < nrPoints; i++) {
			var intersection = intersections[i];
			spaceTransformation.setDirect(intersection.x, 0.0, intersection.z, 1.0);
			// modelViewProjectionMatrix.applyPost(spaceTransformation);
			spaceTransformation.applyPost(modelViewProjectionMatrix);
			intersection.setDirect(spaceTransformation.x, spaceTransformation.y, 0);
			intersection.scale(1 / spaceTransformation.w);
		}

		// find min/max in projector space
		var minX = Number.MAX_VALUE;
		var maxX = -Number.MAX_VALUE;
		var minY = Number.MAX_VALUE;
		var maxY = -Number.MAX_VALUE;
		for (var i = 0; i < nrPoints; i++) {
			if (intersections[i].x < minX) {
				minX = intersections[i].x;
			}
			if (intersections[i].x > maxX) {
				maxX = intersections[i].x;
			}
			if (intersections[i].y < minY) {
				minY = intersections[i].y;
			}
			if (intersections[i].y > maxY) {
				maxY = intersections[i].y;
			}
		}

		// create range matrix
		var rangeMatrix = this.rangeMatrix;
		rangeMatrix.setIdentity();
		rangeMatrix.e00 = maxX - minX;
		rangeMatrix.e11 = maxY - minY;
		rangeMatrix.e03 = minX;
		rangeMatrix.e13 = minY;

		var modelViewProjectionInverseMatrix = projectorCamera.getViewProjectionInverseMatrix();
		rangeMatrix.mul2(modelViewProjectionInverseMatrix, rangeMatrix);

		source.setDirect(0.5, 0.5);
		this.getWorldIntersectionHomogenous(0.0, source, rangeMatrix, this.intersectBottomLeft);
		source.setDirect(0.5, 1);
		this.getWorldIntersectionHomogenous(0.0, source, rangeMatrix, this.intersectTopLeft);
		source.setDirect(1, 1);
		this.getWorldIntersectionHomogenous(0.0, source, rangeMatrix, this.intersectTopRight);
		source.setDirect(1, 0.5);
		this.getWorldIntersectionHomogenous(0.0, source, rangeMatrix, this.intersectBottomRight);

		return true;
	};

	ProjectedGrid.prototype.getWorldIntersectionHomogenous = function (planeHeight, screenPosition, modelViewProjectionInverseMatrix, store) {
		this.calculateIntersection(planeHeight, screenPosition, modelViewProjectionInverseMatrix);
		store.set(this.origin);
	};

	ProjectedGrid.prototype.getWorldIntersection = function (planeHeight, screenPosition, modelViewProjectionInverseMatrix, store) {
		this.calculateIntersection(planeHeight, screenPosition, modelViewProjectionInverseMatrix);
		store.setDirect(this.origin.x, this.origin.y, this.origin.z).scale(1 / this.origin.w);
	};

	ProjectedGrid.prototype.getWorldIntersectionSimple = function (planeHeight, source, destination, store, tmpStorage) {
		var origin = store.set(source);
		var direction = tmpStorage.set(destination).sub(origin);

		var t = (planeHeight - origin.y) / (direction.y);

		direction.scale(t);
		origin.add(direction);

		return t >= 0.0 && t <= 1.0;
	};

	ProjectedGrid.prototype.calculateIntersection = function (planeHeight, screenPosition, modelViewProjectionInverseMatrix) {
		this.origin.setDirect(screenPosition.x * 2 - 1, screenPosition.y * 2 - 1, -1, 1);
		this.direction.setDirect(screenPosition.x * 2 - 1, screenPosition.y * 2 - 1, 1, 1);

		// modelViewProjectionInverseMatrix.applyPost(this.origin);
		// modelViewProjectionInverseMatrix.applyPost(this.direction);
		this.origin.applyPost(modelViewProjectionInverseMatrix);
		this.direction.applyPost(modelViewProjectionInverseMatrix);

		this.direction.sub(this.origin);

		// final double t = (planeHeight * this.origin.getW() - this.origin.y)
		// / (direction.y - planeHeight * direction.getW());

		if (Math.abs(this.direction.y) > MathUtils.EPSILON) {
			var t = (planeHeight - this.origin.y) / this.direction.y;
			this.direction.scale(t);
		} else {
			this.direction.normalize();
			this.direction.scale(this.mainCamera._frustumFar);
		}

		this.origin.add(this.direction);
	};

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {ProjectedGrid} Self for chaining.
	 */
	ProjectedGrid.prototype.rebuild = function () {
		var vbuf = this.getAttributeBuffer(MeshData.POSITION);
		var texs = this.getAttributeBuffer(MeshData.TEXCOORD0);
		var indices = this.getIndexBuffer();

		var densityX = this.densityX;
		var densityY = this.densityY;

		for (var x = 0; x < densityX; x++) {
			for (var y = 0; y < densityY; y++) {
				vbuf[(x + (y * densityX)) * 3 + 0] = x;
				vbuf[(x + (y * densityX)) * 3 + 1] = 0;
				vbuf[(x + (y * densityX)) * 3 + 2] = y;

				texs[(x + (y * densityX)) * 2 + 0] = x / (densityX - 1);
				texs[(x + (y * densityX)) * 2 + 1] = y / (densityY - 1);
			}
		}

		// go through entire array up to the second to last column.
		var index = 0;
		for (var i = 0; i < (densityX * (densityY - 1)); i++) {
			// we want to skip the top row.
			if (i % ((densityX * (Math.floor(i / densityX) + 1)) - 1) === 0 && i !== 0) {
				continue;
			}

			// set the top left corner.
			indices[index++] = i;
			// indexBuffer.put(i);
			// set the bottom right corner.
			indices[index++] = 1 + densityX + i;
			// indexBuffer.put((1 + densityX) + i);
			// set the top right corner.
			indices[index++] = 1 + i;
			// indexBuffer.put(1 + i);
			// set the top left corner
			indices[index++] = i;
			// indexBuffer.put(i);
			// set the bottom left corner
			indices[index++] = densityX + i;
			// indexBuffer.put(densityX + i);
			// set the bottom right corner
			indices[index++] = 1 + densityX + i;
			// indexBuffer.put((1 + densityX) + i);
		}

		return this;
	};

	return ProjectedGrid;
})(goo.MeshData,goo.Vector2,goo.Vector3,goo.Vector4,goo.Matrix4,goo.Camera,goo.MathUtils);
goo.ProjectedGridWaterRenderer = (function (
	MeshData,
	Shader,
	Camera,
	Plane,
	RenderTarget,
	FullscreenPass,
	Vector3,
	Vector4,
	Material,
	Texture,
	TextureCreator,
	ShaderLib,
	ShaderFragment
) {
	'use strict';

	/**
	 * Handles pre-rendering of water planes. Attach this to the rendersystem pre-renderers.
	 * @param {Object} [settings] Water settings passed in a JSON object
	 * @param {boolean} [settings.divider=1] Resolution divider for reflection/refraction
	 */
	function ProjectedGridWaterRenderer(settings) {
		this.waterCamera = new Camera(45, 1, 0.1, 2000);
		this.renderList = [];

		this.waterPlane = new Plane();

		settings = settings || {};

		var width = window.innerWidth / (settings.divider || 4);
		var height = window.innerHeight / (settings.divider || 4);
		this.renderTarget = new RenderTarget(width, height);
		width = window.innerWidth / (settings.divider || 1);
		height = window.innerHeight / (settings.divider || 1);
		this.heightTarget = new RenderTarget(width, height, {
			type: 'Float'
		});
		this.normalTarget = new RenderTarget(width, height, {
			// type: 'Float'
		});

		this.fullscreenPass = new FullscreenPass(ShaderLib.normalmap);
		this.fullscreenPass.material.shader.uniforms.resolution = [width, height];

		var waterMaterial = this.waterMaterial = new Material(waterShaderDef, 'WaterMaterial');
		waterMaterial.cullState.enabled = false;

		var texture = null;
		if (settings.normalsTexture) {
			texture = settings.normalsTexture;
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
		waterMaterial.setTexture('REFLECTION_MAP', this.renderTarget);
		waterMaterial.setTexture('BUMP_MAP', this.heightTarget);
		waterMaterial.setTexture('NORMAL_MAP_COARSE', this.normalTarget);
		//waterMaterial.shader.uniforms.screenSize = [this.heightTarget.width, this.heightTarget.height];
		// waterMaterial.wireframe = true;

		// var materialWire = this.materialWire = new Material(ShaderLib.simple, 'mat');
		// materialWire.wireframe = true;
		// materialWire.wireframeColor = [0, 0, 0];

		this.calcVect = new Vector3();
		this.camReflectDir = new Vector3();
		this.camReflectUp = new Vector3();
		this.camReflectLeft = new Vector3();
		this.camLocation = new Vector3();
		this.camReflectPos = new Vector3();

		this.waterEntity = null;
		this.clipPlane = new Vector4();

		var projData = this.projData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 4, 6);
		projData.getAttributeBuffer(MeshData.POSITION).set([
			0, 0, 0,
			1, 0, 0,
			1, 1, 0,
			0, 1, 0
		]);
		projData.getIndexBuffer().set([1, 3, 0, 2, 3, 1]);
		var materialProj = new Material(projShaderDef, 'mat');
		this.projRenderable = {
			meshData: projData,
			materials: [materialProj]
		};
	}

	ProjectedGridWaterRenderer.prototype.updateHelper = function (intersectBottomLeft, intersectBottomRight, intersectTopRight, intersectTopLeft) {
		var vbuf = this.projData.getAttributeBuffer(MeshData.POSITION);
		vbuf[0] = intersectBottomLeft.x / intersectBottomLeft.w;
		vbuf[1] = 0.0;
		vbuf[2] = intersectBottomLeft.z / intersectBottomLeft.w;
		vbuf[3] = intersectBottomRight.x / intersectBottomRight.w;
		vbuf[4] = 0.0;
		vbuf[5] = intersectBottomRight.z / intersectBottomRight.w;
		vbuf[6] = intersectTopRight.x / intersectTopRight.w;
		vbuf[7] = 0.0;
		vbuf[8] = intersectTopRight.z / intersectTopRight.w;
		vbuf[9] = intersectTopLeft.x / intersectTopLeft.w;
		vbuf[10] = 0.0;
		vbuf[11] = intersectTopLeft.z / intersectTopLeft.w;
		this.projData.setVertexDataUpdated();
	};

	ProjectedGridWaterRenderer.prototype.process = function (renderer, entities, partitioner, camera, lights) {
		if (!this.waterEntity) {
			return;
		}

		entities = entities.filter(function (entity) {
			return entity.meshRendererComponent.isReflectable;
		});

		var meshData = this.waterEntity.meshDataComponent.meshData;
		meshData.update(camera);
		this.waterMaterial.shader.uniforms.intersectBottomLeft = [meshData.intersectBottomLeft.x, meshData.intersectBottomLeft.y, meshData.intersectBottomLeft.z, meshData.intersectBottomLeft.w];
		this.waterMaterial.shader.uniforms.intersectBottomRight = [meshData.intersectBottomRight.x, meshData.intersectBottomRight.y, meshData.intersectBottomRight.z, meshData.intersectBottomRight.w];
		this.waterMaterial.shader.uniforms.intersectTopLeft = [meshData.intersectTopLeft.x, meshData.intersectTopLeft.y, meshData.intersectTopLeft.z, meshData.intersectTopLeft.w];
		this.waterMaterial.shader.uniforms.intersectTopRight = [meshData.intersectTopRight.x, meshData.intersectTopRight.y, meshData.intersectTopRight.z, meshData.intersectTopRight.w];

		this.updateHelper(meshData.intersectBottomLeft, meshData.intersectBottomRight, meshData.intersectTopRight, meshData.intersectTopLeft);
		//TODO: draw helper to rendertarget
		renderer.render(this.projRenderable, camera, lights, this.heightTarget, true);
		this.fullscreenPass.render(renderer, this.normalTarget, this.heightTarget, 0);

		var waterPlane = this.waterPlane;

		this.waterCamera.copy(camera);
		waterPlane.constant = this.waterEntity.transformComponent.transform.translation.y;

		var aboveWater = camera.translation.y > waterPlane.constant;
		if (aboveWater) {
			var calcVect = this.calcVect;
			var camReflectDir = this.camReflectDir;
			var camReflectUp = this.camReflectUp;
			var camReflectLeft = this.camReflectLeft;
			var camLocation = this.camLocation;
			var camReflectPos = this.camReflectPos;

			camLocation.set(camera.translation);
			var planeDistance = waterPlane.pseudoDistance(camLocation);
			calcVect.set(waterPlane.normal).scale(planeDistance * 2.0);
			camReflectPos.set(camLocation.sub(calcVect));

			camLocation.set(camera.translation).add(camera._direction);
			planeDistance = waterPlane.pseudoDistance(camLocation);
			calcVect.set(waterPlane.normal).scale(planeDistance * 2.0);
			camReflectDir.set(camLocation.sub(calcVect)).sub(camReflectPos).normalize();

			camLocation.set(camera.translation).add(camera._up);
			planeDistance = waterPlane.pseudoDistance(camLocation);
			calcVect.set(waterPlane.normal).scale(planeDistance * 2.0);
			camReflectUp.set(camLocation.sub(calcVect)).sub(camReflectPos).normalize();

			camReflectLeft.set(camReflectUp).cross(camReflectDir).normalize();

			this.waterCamera.translation.set(camReflectPos);
			this.waterCamera._direction.set(camReflectDir);
			this.waterCamera._up.set(camReflectUp);
			this.waterCamera._left.set(camReflectLeft);
			this.waterCamera.normalize();
			this.waterCamera.update();

			if (this.skybox) {
				var target = this.skybox.transformComponent.worldTransform;
				target.translation.set(camReflectPos);
				target.update();
			}
		}

		this.waterMaterial.shader.uniforms.abovewater = aboveWater;

		this.waterEntity.skip = true;
		// textured1.uniforms.heightLimit = waterPlane.constant;
		// textured2.uniforms.heightLimit = waterPlane.constant;

		this.renderList.length = 0;
		partitioner.process(this.waterCamera, entities, this.renderList);

		this.clipPlane.setDirect(waterPlane.normal.x, waterPlane.normal.y, waterPlane.normal.z, waterPlane.constant);
		this.waterCamera.setToObliqueMatrix(this.clipPlane);

		renderer.render(this.renderList, this.waterCamera, lights, this.renderTarget, true);

		this.waterEntity.skip = false;
		// textured1.uniforms.heightLimit = -10000.0;
		// textured2.uniforms.heightLimit = -10000.0;

		if (aboveWater && this.skybox) {
			var source = camera.translation;
			var target = this.skybox.transformComponent.worldTransform;
			target.translation.set(source);
			target.update();
		}
	};

	ProjectedGridWaterRenderer.prototype.setSkyBox = function (skyboxEntity) {
		this.skybox = skyboxEntity;
	};

	ProjectedGridWaterRenderer.prototype.setWaterEntity = function (entity) {
		this.waterEntity = entity;
		this.waterEntity.meshRendererComponent.cullMode = 'Never';
		this.waterEntity.meshRendererComponent.materials[0] = this.waterMaterial;
		// this.waterEntity.meshRendererComponent.materials[1] = this.materialWire;

		var meshData = this.waterEntity.meshDataComponent.meshData;
		this.waterMaterial.shader.uniforms.density = [meshData.densityX, meshData.densityY];
	};

	var waterShaderDef = {
		attributes: {
			//vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			normalMatrix: Shader.NORMAL_MATRIX,
			cameraPosition: Shader.CAMERA,
			normalMap: 'NORMAL_MAP',
			reflection: 'REFLECTION_MAP',
			bump: 'BUMP_MAP',
			normalMapCoarse: 'NORMAL_MAP_COARSE',
			vertexNormal: [
				0, -1, 0
			],
			vertexTangent: [
				1, 0, 0, 1
			],
			waterColor: [
				15, 15, 15
			],
			abovewater: true,
			fogColor: [
				1.0, 1.0, 1.0, 1.0
			],
			sunDirection: [
				0.66, -0.1, 0.66
			],
			coarseStrength: 0.25,
			detailStrength: 2.0,
			fogStart: 0.0,
			camNear: Shader.NEAR_PLANE,
			camFar: Shader.FAR_PLANE,
			time: Shader.TIME,
			intersectBottomLeft: [0, 0, 0, 0],
			intersectTopLeft: [0, 0, 0, 0],
			intersectTopRight: [0, 0, 0, 0],
			intersectBottomRight: [0, 0, 0, 0],
			grid: false,
			heightMultiplier: 50.0,
			density: [1, 1]
			//screenSize: [1, 1]
		},
		vshader: [
			//'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform vec3 vertexNormal;',
			'uniform vec4 vertexTangent;',
			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform mat3 normalMatrix;',
			'uniform vec3 cameraPosition;',
			'uniform float time;',
			'uniform vec3 sunDirection;',
			'uniform float coarseStrength;',
			'uniform float heightMultiplier;',
			//'uniform vec2 screenSize;',

			'uniform sampler2D bump;',

			'uniform vec4 intersectBottomLeft;',
			'uniform vec4 intersectTopLeft;',
			'uniform vec4 intersectTopRight;',
			'uniform vec4 intersectBottomRight;',

			'varying vec2 texCoord0;',
			'varying vec2 texCoord1;',
			'varying vec3 eyeVec;',
			'varying vec3 sunDir;',
			'varying vec4 viewCoords;',
			'varying vec3 worldPos;',
			'varying vec3 normal;',

			// ShaderFragment.features.noise3d,

			'void main(void) {',
			'	vec4 pointTop = mix(intersectTopLeft, intersectTopRight, vertexUV0.x);',
			'	vec4 pointBottom = mix(intersectBottomLeft, intersectBottomRight, vertexUV0.x);',
			'	vec4 pointFinal = mix(pointTop, pointBottom, 1.0 - vertexUV0.y);',
			'	pointFinal.xz /= pointFinal.w;',
			'	pointFinal.y = 0.0;',

			'	vec4 screenpos = projectionMatrix * viewMatrix * worldMatrix * vec4(pointFinal.xyz, 1.0);',
			'	vec2 projCoord = screenpos.xy / screenpos.q;',
			'	projCoord = (projCoord + 1.0) * 0.5;',

			// '	float height1 = texture2D(bump, projCoord + vec2(-2.0, 0.0)/screenSize).x;',
			// '	float height2 = texture2D(bump, projCoord + vec2(2.0, 0.0)/screenSize).x;',
			// '	float height3 = texture2D(bump, projCoord + vec2(0.0, -2.0)/screenSize).x;',
			// '	float height4 = texture2D(bump, projCoord + vec2(0.0, 2.0)/screenSize).x;',
			// '	vec3 vec12 = vec3(2.0, height2-height1, 0.0);',
			// '	vec3 vec13 = vec3(0.0, height4-height3, 2.0);',
			// '	normal = normalize(cross(vec12, vec13) * vec3(coarseStrength, 1.0, coarseStrength));',

			// '	float height = texture2D(bump, (pointFinal.xz) * 0.0002 + time * 0.002).x;',
			'	float height = texture2D(bump, projCoord).x;',
			'	pointFinal.y = height * heightMultiplier;',

			'	texCoord1 = vertexUV0;',

            '	vec4 pos = worldMatrix * vec4(pointFinal.xyz, 1.0);',
			'	worldPos = pos.xyz;',
			// '	worldPos = (worldMatrix * vec4(vertexPosition, 1.0)).xyz;',

			'	texCoord0 = worldPos.xz * 2.0;',

			'	vec3 n = normalize(normalMatrix * vertexNormal);',
			'	vec3 t = normalize(normalMatrix * vertexTangent.xyz);',
			'	vec3 b = cross(n, t) * vertexTangent.w;',
			'	mat3 rotMat = mat3(t, b, n);',

			'	vec3 eyeDir = worldPos - cameraPosition;',
			'	eyeVec = eyeDir * rotMat;',

			'	sunDir = sunDirection * rotMat;',

			'	viewCoords = projectionMatrix * viewMatrix * pos;',
			'	gl_Position = viewCoords;',
			'}'//
		].join('\n'),
		fshader: [
			'uniform sampler2D normalMap;',
			'uniform sampler2D reflection;',
			'uniform sampler2D normalMapCoarse;',

			'uniform vec3 waterColor;',
			'uniform bool abovewater;',
			'uniform vec4 fogColor;',
			'uniform float time;',
			'uniform bool grid;',
			'uniform vec2 density;',

			'uniform float camNear;',
			'uniform float camFar;',
			'uniform float fogStart;',
			'uniform float coarseStrength;',
			'uniform float detailStrength;',

			'varying vec2 texCoord0;',
			'varying vec2 texCoord1;',
			'varying vec3 eyeVec;',
			'varying vec3 sunDir;',
			'varying vec4 viewCoords;',
			'varying vec3 worldPos;',
			'varying vec3 normal;',

			'const vec3 sunColor = vec3(1.0, 0.96, 0.96);',

			'vec4 getNoise(vec2 uv) {',
			'    vec2 uv0 = (uv/123.0)+vec2(time/17.0, time/29.0);',
			'    vec2 uv1 = uv/127.0-vec2(time/-19.0, time/31.0);',
			'    vec2 uv2 = uv/vec2(897.0, 983.0)+vec2(time/51.0, time/47.0);',
			'    vec2 uv3 = uv/vec2(991.0, 877.0)-vec2(time/59.0, time/-63.0);',
			'    vec4 noise = (texture2D(normalMap, uv0)) +',
			'                 (texture2D(normalMap, uv1)) +',
			'                 (texture2D(normalMap, uv2)*3.0) +',
			'                 (texture2D(normalMap, uv3)*3.0);',
			'    return noise/4.0-1.0;',
			'}',

			'void main(void)',
			'{',
			'	vec2 projCoord = viewCoords.xy / viewCoords.q;',
			'	projCoord = (projCoord + 1.0) * 0.5;',

			'	float fs = camFar * fogStart;',
			'	float fogDist = clamp(max(viewCoords.z - fs, 0.0)/(camFar - camNear - fs), 0.0, 1.0);',

			'	vec3 coarseNormal = texture2D(normalMapCoarse, projCoord).xyz * 2.0 - 1.0;',

			'	vec2 normCoords = texCoord0;',
			'	vec4 noise = getNoise(normCoords);',
			'	vec3 normalVector = normalize(noise.xyz * vec3(1.8 * detailStrength, 1.8 * detailStrength, 1.0) + coarseNormal.xyz * vec3(1.8 * coarseStrength, 1.8 * coarseStrength, 1.0));',
			// '	vec3 normalVector = vec3(0.0, 0.0, 1.0);',

			'	vec3 localView = normalize(eyeVec);',
			'	float fresnel = dot(normalize(normalVector*vec3(1.0, 1.0, 1.0)), localView);',
			'	if ( abovewater == false ) {',
			'		fresnel = -fresnel;',
			'	}',
			// '	fresnel *= 1.0 - fogDist;',
			'	float fresnelTerm = 1.0 - fresnel;',
			'	fresnelTerm *= fresnelTerm;',
			'	fresnelTerm *= fresnelTerm;',
			// '	fresnelTerm *= fresnelTerm;',
			// '	fresnelTerm *= fresnelTerm;',
			'	fresnelTerm = fresnelTerm * 0.95 + 0.05;',

			'	if ( abovewater == true ) {',
			'		projCoord.x = 1.0 - projCoord.x;',
			'	}',

			// '	projCoord += (dudvColor.xy * 0.5 + normalVector.xy * 0.0);',
			'	projCoord += (normalVector.xy * 0.05);',
			// '	projCoord += (normalVector.xy * 0.04 + normal.xy);',
			'	projCoord = clamp(projCoord, 0.001, 0.999);',

			' vec4 waterColorX = vec4(waterColor / 255.0, 1.0);',

			'	vec4 reflectionColor = texture2D(reflection, projCoord);',
			'	if ( abovewater == false ) {',
			'		reflectionColor *= vec4(0.8,0.9,1.0,1.0);',
			'		vec4 endColor = mix(reflectionColor,waterColorX,fresnelTerm);',
			'		gl_FragColor = mix(endColor,waterColorX,fogDist);',
			'	}',
			'	else {',
			'		vec3 diffuse = vec3(0.0);',
			'		vec3 specular = vec3(0.0);',
			// '	    sunLight(normalVector, localView, 100.0, 2.0, 0.4, diffuse, specular);',

			'		vec3 sunreflection = normalize(reflect(-sunDir, normalVector));',
			'		float direction = max(0.0, dot(localView, sunreflection));',
			'		specular += pow(direction, 100.0)*sunColor * 2.0;',
			'		diffuse += max(dot(sunDir, normalVector),0.0)*sunColor*0.4;',

			'		vec4 endColor = mix(waterColorX,reflectionColor,fresnelTerm);',
			'		gl_FragColor = mix(vec4(diffuse*0.0 + specular, 1.0) + mix(endColor,reflectionColor,fogDist), fogColor, fogDist);',
			// '		gl_FragColor = vec4(diffuse + specular, 1.0);',
			'	}',

			// '	gl_FragColor = vec4(normalVector * 0.5 + 0.5, 1.0);',
			// '	gl_FragColor = vec4((coarseNormal * vec3(1.8 * coarseStrength, 1.8 * coarseStrength, 1.0)) * 0.5 + 0.5, 1.0);',
			// draw grid helper
			'	if (grid) {',
			'		vec2 low = abs(fract(texCoord1*density)-0.5);',
			'		float dist = 1.0 - step(min(low.x, low.y), 0.05);',
			'		gl_FragColor *= vec4(dist);',
			'	}',
			'}'
		].join('\n')
	};

	var projShaderDef = {
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			//diffuseMap: Shader.TEXTURE0,
			//camNear: Shader.NEAR_PLANE,
			//camFar: Shader.FAR_PLANE,
			time: Shader.TIME
		},
		vshader: [
		'attribute vec3 vertexPosition;',

		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec4 worldPos;',
		'varying vec4 viewCoords;',

		'void main(void) {',
		'	worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
		'	viewCoords = viewMatrix * worldPos;',
		'	gl_Position = projectionMatrix * viewMatrix * worldPos;',
		'}'//
		].join('\n'),
		fshader: [
		//'uniform sampler2D diffuseMap;',
		//'uniform float opacity;',
		//'uniform float camNear;',
		//'uniform float camFar;',
		'uniform float time;',

		'varying vec4 worldPos;',
		'varying vec4 viewCoords;',

		ShaderFragment.noise3d,

		'vec4 getNoise(sampler2D map, vec2 uv) {',
		'    vec2 uv0 = (uv/223.0)+vec2(time/17.0, time/29.0);',
		'    vec2 uv1 = uv/327.0-vec2(time/-19.0, time/31.0);',
		'    vec2 uv2 = uv/vec2(697.0, 983.0)+vec2(time/151.0, time/147.0);',
		'    vec2 uv3 = uv/vec2(791.0, 877.0)-vec2(time/259.0, time/263.0);',
		'    vec4 noise = (texture2D(map, uv0)*0.0) +',
		'                 (texture2D(map, uv1)*0.0) +',
		'                 (texture2D(map, uv2)*0.0) +',
		'                 (texture2D(map, uv3)*10.0);',
		'    return noise/5.0-1.0;',
		'}',

		'void main(void)',
		'{',
		//'	float fs = camFar * 0.5;',
		// '	float fogDist = clamp(max(viewCoords.z - fs, 0.0)/(camFar - camNear - fs), 0.0, 1.0);',
		'	float fogDist = clamp(-viewCoords.z / 1000.0, 0.0, 1.0);',

		// '	gl_FragColor = mix(texture2D(diffuseMap, worldPos.xz * 0.001), vec4(0.5), fogDist);',

		// '	vec4 noise = getNoise(diffuseMap, worldPos.xz * 1.0);',
		// '	gl_FragColor = noise;',
		'	gl_FragColor = vec4((snoise(vec3(worldPos.xz * 0.008, time * 0.4))+snoise(vec3(worldPos.xz * 0.02, time * 0.8))*0.5)/10.0);',
		'}'//
		].join('\n')
	};

	return ProjectedGridWaterRenderer;
})(goo.MeshData,goo.Shader,goo.Camera,goo.Plane,goo.RenderTarget,goo.FullscreenPass,goo.Vector3,goo.Vector4,goo.Material,goo.Texture,goo.TextureCreator,goo.ShaderLib,goo.ShaderFragment);
if (typeof require === "function") {
define("goo/addons/waterpack/FlatWaterRenderer", [], function () { return goo.FlatWaterRenderer; });
define("goo/addons/waterpack/ProjectedGrid", [], function () { return goo.ProjectedGrid; });
define("goo/addons/waterpack/ProjectedGridWaterRenderer", [], function () { return goo.ProjectedGridWaterRenderer; });
}
