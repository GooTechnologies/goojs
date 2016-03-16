import MeshData from '../../renderer/MeshData';
import Shader from '../../renderer/Shader';
import Camera from '../../renderer/Camera';
import Plane from '../../math/Plane';
import RenderTarget from '../../renderer/pass/RenderTarget';
import FullscreenPass from '../../renderer/pass/FullscreenPass';
import Vector3 from '../../math/Vector3';
import Vector4 from '../../math/Vector4';
import Material from '../../renderer/Material';
import Texture from '../../renderer/Texture';
import TextureCreator from '../../renderer/TextureCreator';
import ShaderLib from '../../renderer/shaders/ShaderLib';
import ShaderFragment from '../../renderer/shaders/ShaderFragment';



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

	export default ProjectedGridWaterRenderer;