define([
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'goo/renderer/Texture',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/light/DirectionalLight',
	'goo/util/CanvasUtils',
	'goo/util/Ajax',
	'goo/noise/Noise',
	'goo/noise/ValueNoise',
	'goo/shapes/TerrainSurface',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/renderer/shaders/ShaderFragment',
	'goo/addons/water/FlatWaterRenderer',
	'goo/entities/EntityUtils',
	'goo/scripts/WorldFittedTerrainScript',
	'goo/renderer/shaders/ShaderLib',
	'goo/addons/hunter/Vegetation',
	'goo/addons/hunter/Forrest',
	'goo/util/rsvp'
],
/** @lends */
function(
	Material,
	Camera,
	Vector3,
	TextureCreator,
	Texture,
	MeshData,
	Shader,
	DirectionalLight,
	CanvasUtils,
	Ajax,
	Noise,
	ValueNoise,
	TerrainSurface,
	ShaderBuilder,
	ShaderFragment,
	FlatWaterRenderer,
	EntityUtils,
	WorldFittedTerrainScript,
	ShaderLib,
	Vegetation,
	Forrest,
	RSVP
) {
	"use strict";

	function Terrain() {}

	Terrain.prototype.init = function(goo) {
		var promise = new RSVP.Promise();

		var canvasUtils = new CanvasUtils();
		var resourcePath = window.hunterResources;

		canvasUtils.loadCanvasFromPath(resourcePath + '/height128.png', function(canvas) {
			var dim = {
				minX: -64,
				maxX: 64,
				minY: 0,
				maxY: 50,
				minZ: -64,
				maxZ: 64
			};

			var matrix = canvasUtils.getMatrixFromCanvas(canvas);
			this._buildMesh(goo, matrix, dim, 128, 128);

			// promise.resolve();

			var ws = new WorldFittedTerrainScript();
			var terrainData1 = ws.addHeightData(matrix, dim);

			var vegetationPromise = new Vegetation().init(goo, ws);
			var forrestPromise = new Forrest().init(goo, ws);

			RSVP.all([vegetationPromise, forrestPromise]).then(function() {
				promise.resolve();
			});
		}.bind(this));

		return promise;
	};

	Terrain.prototype._buildMesh = function(goo, matrix, dim, widthPoints, lengthPoints) {
		var xw = dim.maxX - dim.minX;
		var yw = dim.maxY - dim.minY;
		var zw = dim.maxZ - dim.minZ;

		// --- Physics Start ---
		var floatByteSize = 4;
		var heightBuffer = Ammo.allocate(floatByteSize * widthPoints * lengthPoints, "float", Ammo.ALLOC_NORMAL);

		for (var z = 0; z < lengthPoints; z++) {
			for (var x = 0; x < widthPoints; x++) {
				Ammo.setValue(heightBuffer + (z * widthPoints + x) * floatByteSize, matrix[x][z] * yw, 'float');
			}
		}

		var heightScale = 1.0;
		var minHeight = dim.minY;
		var maxHeight = dim.maxY;
		var upAxis = 1; // 0 => x, 1 => y, 2 => z
		var heightDataType = 0; //PHY_FLOAT;
		var flipQuadEdges = false;

		var shape = new Ammo.btHeightfieldTerrainShape(
			widthPoints,
			lengthPoints,
			heightBuffer,
			heightScale,
			minHeight,
			maxHeight,
			upAxis,
			heightDataType,
			flipQuadEdges
		);

		var sx = xw / widthPoints;
		var sz = zw / lengthPoints;
		var sy = 1.0;

		var sizeVector = new Ammo.btVector3(sx, sy, sz);
		shape.setLocalScaling(sizeVector);

		var ammoTransform = new Ammo.btTransform();
		ammoTransform.setIdentity(); // TODO: is this needed ?
		ammoTransform.setOrigin(new Ammo.btVector3( 0, yw /2, 0 ));
		// ammoTransform.setOrigin(new Ammo.btVector3( xw / 2, 0, zw / 2 ));
		// this.gooQuaternion.fromRotationMatrix(gooTransform.rotation);
		// var q = this.gooQuaternion;
		// ammoTransform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));
		var motionState = new Ammo.btDefaultMotionState( ammoTransform );
		var localInertia = new Ammo.btVector3(0, 0, 0);

		var mass = 0;
		// rigidbody is dynamic if and only if mass is non zero, otherwise static
		// if(mass !== 0.0) {
			// shape.calculateLocalInertia( mass, localInertia );
		// }

		var info = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
		var body = new Ammo.btRigidBody(info);
		body.setFriction(1);

		goo.world.getSystem('AmmoSystem').ammoWorld.addRigidBody(body);
		// --- Physics End ---



		var resourcePath = window.hunterResources;

		var meshData = new TerrainSurface(matrix, xw, yw, zw);
		var material = Material.createMaterial(terrainShader, 'Terrain');

		material.uniforms.materialAmbient = [0.0, 0.0, 0.0, 1.0];
		material.uniforms.materialDiffuse = [1.0, 1.0, 1.0, 1.0];

		var texturenorm = new TextureCreator().loadTexture2D(resourcePath + '/normals.png');
		material.setTexture('NORMAL_MAP2', texturenorm);

		var anisotropy = 4;
		var grass1 = new TextureCreator().loadTexture2D(resourcePath + '/grass1.jpg', {
			anisotropy: anisotropy
		});
		var grass2 = new TextureCreator().loadTexture2D(resourcePath + '/grass2.jpg', {
			anisotropy: anisotropy
		});
		var grass3 = new TextureCreator().loadTexture2D(resourcePath + '/grass3.jpg', {
			anisotropy: anisotropy
		});
		var stone = new TextureCreator().loadTexture2D(resourcePath + '/stone.jpg', {
			anisotropy: anisotropy
		});
		material.setTexture('GROUND_MAP1', grass1);
		material.setTexture('GROUND_MAP2', grass2);
		material.setTexture('GROUND_MAP3', grass3);
		material.setTexture('GROUND_MAP4', stone);

		var grass1n = new TextureCreator().loadTexture2D(resourcePath + '/grass1n.jpg', {
			anisotropy: anisotropy
		});
		var grass2n = new TextureCreator().loadTexture2D(resourcePath + '/grass2n.jpg', {
			anisotropy: anisotropy
		});
		var grass3n = new TextureCreator().loadTexture2D(resourcePath + '/grass3n.jpg', {
			anisotropy: anisotropy
		});
		var stonen = new TextureCreator().loadTexture2D(resourcePath + '/stonen.jpg', {
			anisotropy: anisotropy
		});
		material.setTexture('GROUND_MAP1_NORMALS', grass1n);
		material.setTexture('GROUND_MAP2_NORMALS', grass2n);
		material.setTexture('GROUND_MAP3_NORMALS', grass3n);
		material.setTexture('GROUND_MAP4_NORMALS', stonen);

		// var material2 = Material.createMaterial(ShaderLib.simpleColored, 'Terrain2');
		// material2.wireframe = true;
		// var surfaceEntity = EntityUtils.createTypicalEntity(goo.world, 'Terrain', meshData, material, material2);
		var surfaceEntity = EntityUtils.createTypicalEntity(goo.world, 'Terrain', meshData, material);
		surfaceEntity.transformComponent.transform.translation.setd(-xw / 2, 0, -zw / 2);
		surfaceEntity.transformComponent.setUpdated();
		surfaceEntity.addToWorld();

		surfaceEntity.meshRendererComponent.cullMode = 'Never';
	};

	var terrainShader = {
		processors: [
			ShaderBuilder.uber.processor,
			ShaderBuilder.light.processor,
			ShaderBuilder.animation.processor
		],
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexNormal: MeshData.NORMAL,
			vertexTangent: MeshData.TANGENT,
			vertexColor: MeshData.COLOR,
			vertexUV0: MeshData.TEXCOORD0,
			vertexUV1: MeshData.TEXCOORD1,
			vertexJointIDs: MeshData.JOINTIDS,
			vertexWeights: MeshData.WEIGHTS
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			normalMatrix: Shader.NORMAL_MATRIX,
			cameraPosition: Shader.CAMERA,
			normalMap2: 'NORMAL_MAP2',
			groundMap1: 'GROUND_MAP1',
			groundMap2: 'GROUND_MAP2',
			groundMap3: 'GROUND_MAP3',
			groundMap4: 'GROUND_MAP4',
			groundMapN1: 'GROUND_MAP1_NORMALS',
			groundMapN2: 'GROUND_MAP2_NORMALS',
			groundMapN3: 'GROUND_MAP3_NORMALS',
			groundMapN4: 'GROUND_MAP4_NORMALS',
			diffuseMap: Shader.DIFFUSE_MAP,
			offsetRepeat: [0, 0, 1, 1],
			normalMap: Shader.NORMAL_MAP,
			normalMultiplier: 1.0,
			specularMap: Shader.SPECULAR_MAP,
			emissiveMap: Shader.EMISSIVE_MAP,
			aoMap: Shader.AO_MAP,
			lightMap: Shader.LIGHT_MAP,
			environmentCube: 'ENVIRONMENT_CUBE',
			environmentSphere: 'ENVIRONMENT_SPHERE',
			reflectionMap: 'REFLECTION_MAP',
			transparencyMap: 'TRANSPARENCY_MAP',
			opacity: 1.0,
			reflectivity: 0.0,
			refractivity: 0.0,
			etaRatio: 0.0,
			fresnel: 0.0,
			discardThreshold: -0.01,
			fogSettings: [0, 10000],
			fogColor: [1, 1, 1],
			shadowDarkness: 0.5
		},
		builder: function(shader, shaderInfo) {
			ShaderBuilder.light.builder(shader, shaderInfo);
		},
		vshader: function() {
			return [
				'attribute vec3 vertexPosition;',

				'#ifdef NORMAL',
				'attribute vec3 vertexNormal;',
				'#endif',
				'#ifdef TANGENT',
				'attribute vec4 vertexTangent;',
				'#endif',
				'#ifdef COLOR',
				'attribute vec4 vertexColor;',
				'#endif',
				'#ifdef TEXCOORD0',
				'attribute vec2 vertexUV0;',
				'uniform vec4 offsetRepeat;',
				'varying vec2 texCoord0;',
				'#endif',
				'#ifdef TEXCOORD1',
				'attribute vec2 vertexUV1;',
				'varying vec2 texCoord1;',
				'#endif',

				'uniform mat4 viewProjectionMatrix;',
				'uniform mat4 worldMatrix;',
				'uniform mat4 normalMatrix;',
				'uniform vec3 cameraPosition;',

				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',
				'#ifdef NORMAL',
				'varying vec3 normal;',
				'#endif',
				'#ifdef TANGENT',
				'varying vec3 binormal;',
				'varying vec3 tangent;',
				'#endif',
				'#ifdef COLOR',
				'varying vec4 color;',
				'#endif',

				'varying float noise;',
				'varying float noise2;',

				ShaderBuilder.light.prevertex,

				'void main(void) {',
				'mat4 wMatrix = worldMatrix;',
				'#ifdef NORMAL',
				'mat4 nMatrix = normalMatrix;',
				'#endif',

				// 'float height = texture2D(heightMap, vertexUV0).r * 50.0;',
				// 'vec4 worldPos = wMatrix * vec4(vertexPosition.x, height, vertexPosition.z, 1.0);',
				'vec4 worldPos = wMatrix * vec4(vertexPosition, 1.0);',
				'vWorldPos = worldPos.xyz;',
				'gl_Position = viewProjectionMatrix * worldPos;',

				'viewPosition = cameraPosition - worldPos.xyz;',

				'#ifdef NORMAL',
				'	normal = normalize((nMatrix * vec4(vertexNormal, 0.0)).xyz);',
				'#endif',
				'#ifdef TANGENT',
				'	tangent = normalize((nMatrix * vec4(vertexTangent.xyz, 0.0)).xyz);',
				'	binormal = cross(normal, tangent) * vec3(vertexTangent.w);',
				'#endif',
				'#ifdef COLOR',
				'	color = vertexColor;',
				'#endif',
				'#ifdef TEXCOORD0',
				'	texCoord0 = vertexUV0 * offsetRepeat.zw * 1.0 + offsetRepeat.xy;',
				'#endif',
				'#ifdef TEXCOORD1',
				'	texCoord1 = vertexUV1;',
				'#endif',

				ShaderBuilder.light.vertex,

				'noise = (sin(vWorldPos.x * 0.2) + sin(vWorldPos.z * 0.2))*0.25+0.5;',
				'noise2 = 0.0;',
				'}'
			].join('\n');
		},
		fshader: function() {
			return [
				'uniform sampler2D normalMap2;',

				'uniform sampler2D groundMap1;',
				'uniform sampler2D groundMap2;',
				// 'uniform sampler2D groundMap3;',
				'uniform sampler2D groundMap4;',
				'uniform sampler2D groundMapN1;',
				'uniform sampler2D groundMapN2;',
				// 'uniform sampler2D groundMapN3;',
				'uniform sampler2D groundMapN4;',

				// '#ifdef NORMAL_MAP',
				// 'uniform sampler2D normalMap;',
				// 'uniform float normalMultiplier;',
				// '#endif',
				'#ifdef SPECULAR_MAP',
				'uniform sampler2D specularMap;',
				'#endif',

				'#ifdef FOG',
				'uniform vec2 fogSettings;',
				'uniform vec3 fogColor;',
				'#endif',

				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',
				'#ifdef NORMAL',
				'varying vec3 normal;',
				'#endif',
				'#ifdef TANGENT',
				'varying vec3 binormal;',
				'varying vec3 tangent;',
				'#endif',
				'#ifdef TEXCOORD0',
				'varying vec2 texCoord0;',
				'#endif',
				'#ifdef TEXCOORD1',
				'varying vec2 texCoord1; //Use for lightmap',
				'#endif',

				'varying float noise;',
				'varying float noise2;',

				ShaderBuilder.light.prefragment,
				ShaderFragment.noise2d,

				'void main(void)',
				'{',
				'vec4 final_color = vec4(1.0);',

				// procedural texturing calc
				'vec2 coord = texCoord0 * vec2(50.0);',
				'vec2 coord2 = texCoord0 * vec2(15.0);',

				'vec3 landNormal = (texture2D(normalMap2, texCoord0).xyz * vec3(2.0) - vec3(1.0)).xzy;',
				'landNormal.y = 0.5;',
				'landNormal = normalize(landNormal);',
				'vec3 landTangent = vec3(1.0, 0.0, 0.0);',
				'vec3 landBinormal = cross(landNormal, landTangent);',
				'mat3 tangentToWorld = mat3(landTangent, landBinormal, landNormal);',

				'float slope = clamp(1.0 - dot(landNormal, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);',
				'slope = smoothstep(0.0, 0.1, slope);',

				'const float NMUL = 1.2;',
				// 'const float FADEMUL = 0.1;',

				'vec3 n1 = texture2D(groundMapN1, coord).xyz * vec3(2.0) - vec3(1.0);', 'n1.z = NMUL;',
				'vec3 n2 = texture2D(groundMapN2, coord).xyz * vec3(2.0) - vec3(1.0);', 'n2.z = NMUL;',
				// 'vec3 n3 = texture2D(groundMapN3, coord).xyz * vec3(2.0) - vec3(1.0);', 'n3.z = NMUL;',
				'vec3 mountainN = texture2D(groundMapN4, coord).xyz * vec3(2.0) - vec3(1.0);', 'mountainN.z = NMUL;',

				'vec3 tangentNormal = mix(n1, n2, smoothstep(0.0, 1.0, noise));',
				// 'tangentNormal = mix(tangentNormal, n3, smoothstep(0.5, 1.0, noise2));',
				'tangentNormal = mix(tangentNormal, mountainN, slope);',

				'vec3 worldNormal = (tangentToWorld * tangentNormal);',
				'vec3 N = normalize(worldNormal);',
				'N.z = -N.z;',

				// 'N = normalize(landNormal);',

				'vec4 g1 = texture2D(groundMap1, coord);',
				'vec4 g2 = texture2D(groundMap2, coord);',
				// 'vec4 g3 = texture2D(groundMap3, coord);',
				'vec4 mountain = texture2D(groundMap4, coord);',

				// 'vec4 tex1 = texture2D(groundMap1, coord);',
				// 'vec4 tex2 = texture2D(groundMap1, coord2);',
				// 'vec4 g1 = mix(tex1, tex2, min(length(viewPosition) * FADEMUL, 1.0));',

				// 'tex1 = texture2D(groundMap2, coord);',
				// 'tex2 = texture2D(groundMap2, coord2);',
				// 'vec4 g2 = mix(tex1, tex2, min(length(viewPosition) * FADEMUL, 1.0));',

				// 'tex1 = texture2D(groundMap3, coord);',
				// 'tex2 = texture2D(groundMap3, coord2);',
				// 'vec4 g3 = mix(tex1, tex2, min(length(viewPosition) * FADEMUL, 1.0));',

				// 'tex1 = texture2D(groundMap4, coord);',
				// 'tex2 = texture2D(groundMap4, coord2);',
				// 'vec4 mountain = mix(tex1, tex2, min(length(viewPosition) * FADEMUL, 1.0));',

				'final_color = mix(g1, g2, smoothstep(0.0, 1.0, noise));',
				// 'final_color = mix(final_color, g3, smoothstep(0.5, 1.0, noise2));',

				'slope = clamp(1.0 - dot(N, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);',
				'slope = smoothstep(0.0, 0.1, slope);',
				'final_color = mix(final_color, mountain, slope);',

				// 'final_color = vec4(mountain);',
				// 'final_color = vec4(1.0);',
				// 'final_color = vec4(slope);',

				ShaderBuilder.light.fragment,

				// 'final_color = vec4(N, 1.0);',

				// 'final_color.rgb += totalSpecular;',
				// 'final_color.a += min(length(totalSpecular), 1.0);',

				'#ifdef FOG',
				'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
				'final_color.rgb = mix(final_color.rgb, fogColor, d);',
				'#endif',

				'gl_FragColor = final_color;',
				'}'
			].join('\n');
		}
	};

	return Terrain;
});