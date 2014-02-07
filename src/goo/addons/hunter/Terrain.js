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

			this.ws = new WorldFittedTerrainScript();
			this.ws.addHeightData(matrix, dim);

			// promise.resolve();

			this.vegetation = new Vegetation();
			var vegetationPromise = this.vegetation.init(goo.world, this.ws);
			var forrestPromise = new Forrest().init(goo, this.ws);

			RSVP.all([vegetationPromise, forrestPromise]).then(function() {
				promise.resolve();
			});

			// RSVP.all([forrestPromise]).then(function() {
				// promise.resolve();
			// });
		}.bind(this));

		return promise;
	};

	Terrain.prototype.circleVegetation = function() {
		if (this.vegetation) {
			this.vegetation.circleVegetation();
		}
	};


	Terrain.prototype.getHeightAt = function(x, z) {
		if (this.ws) {
			return this.ws.getTerrainHeightAt([x, 0, z]);
		}
		return 0;
	};

	Terrain.prototype.update = function(x, z) {
		if (this.vegetation) {
			this.vegetation.update(x, z);
		}
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
		// var material = Material.createMaterial(ShaderLib.simpleLit, 'Terrain');

		material.uniforms.materialAmbient = [0.0, 0.0, 0.0, 1.0];
		material.uniforms.materialDiffuse = [1.0, 1.0, 1.0, 1.0];
		// material.uniforms.materialDiffuse = [1.5, 1.5, 1.5, 1.0];

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
		defines: {
			SKIP_SPECULAR: true
		},
		processors: [
			ShaderBuilder.light.processor,
		],
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0,
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
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
			fogSettings: function() {
				return ShaderBuilder.FOG_SETTINGS;
			},
			fogColor: function() {
				return ShaderBuilder.FOG_COLOR;
			},
			shadowDarkness: 0.0
		},
		builder: function(shader, shaderInfo) {
			ShaderBuilder.light.builder(shader, shaderInfo);
		},
		vshader: function() {
			return [
				'attribute vec3 vertexPosition;',

				'attribute vec2 vertexUV0;',
				'varying vec2 texCoord0;',

				'uniform mat4 viewProjectionMatrix;',
				'uniform mat4 worldMatrix;',
				'uniform vec3 cameraPosition;',

				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',

				'varying float noise;',

				ShaderBuilder.light.prevertex,

				'void main(void) {',
				'mat4 wMatrix = worldMatrix;',

				// 'float height = texture2D(heightMap, vertexUV0).r * 50.0;',
				// 'vec4 worldPos = wMatrix * vec4(vertexPosition.x, height, vertexPosition.z, 1.0);',
				'vec4 worldPos = wMatrix * vec4(vertexPosition, 1.0);',
				'vWorldPos = worldPos.xyz;',
				'gl_Position = viewProjectionMatrix * worldPos;',

				'viewPosition = cameraPosition - worldPos.xyz;',

				'texCoord0 = vertexUV0;',

				ShaderBuilder.light.vertex,

				'noise = (sin(vWorldPos.x * 0.2) + sin(vWorldPos.z * 0.2))*0.25+0.5;',
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

				'uniform vec2 fogSettings;',
				'uniform vec3 fogColor;',

				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',
				'varying vec2 texCoord0;',

				'varying float noise;',

				ShaderBuilder.light.prefragment,

				'void main(void)',
				'{',
				'vec4 final_color = vec4(1.0);',

				// procedural texturing calc
				'vec2 coord = texCoord0 * vec2(50.0);',

				'vec3 landNormal = (texture2D(normalMap2, texCoord0).xyz * vec3(2.0) - vec3(1.0)).xzy;',
				'landNormal.y = 0.5;',
				'landNormal.z = -landNormal.z;',
				'landNormal = normalize(landNormal);',

				'float slope = clamp(1.0 - dot(landNormal, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);',
				'slope = smoothstep(0.0, 0.1, slope);',

				'const float NMUL = 1.2;',

				'vec3 n1 = texture2D(groundMapN1, coord).xyz * vec3(2.0) - vec3(1.0);', 'n1.z = NMUL;',
				'vec3 n2 = texture2D(groundMapN2, coord).xyz * vec3(2.0) - vec3(1.0);', 'n2.z = NMUL;',
				// 'vec3 n3 = texture2D(groundMapN3, coord).xyz * vec3(2.0) - vec3(1.0);', 'n3.z = NMUL;',
				'vec3 mountainN = texture2D(groundMapN4, coord).xyz * vec3(2.0) - vec3(1.0);', 'mountainN.z = NMUL;',

				'vec3 tangentNormal = mix(n1, n2, smoothstep(0.0, 1.0, noise));',
				'tangentNormal = mix(tangentNormal, mountainN, slope);',

				'vec3 worldNormal = vec3(landNormal.x + tangentNormal.x, landNormal.y, landNormal.z + tangentNormal.y);',
				'vec3 N = normalize(worldNormal);',
				'N = normalize(landNormal);',

				'vec4 g1 = texture2D(groundMap1, coord);',
				'vec4 g2 = texture2D(groundMap2, coord);',
				// 'vec4 g3 = texture2D(groundMap3, coord);',
				'vec4 mountain = texture2D(groundMap4, coord);',

				'final_color = mix(g1, g2, smoothstep(0.0, 1.0, noise));',

				'slope = clamp(1.0 - dot(N, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);',
				'slope = smoothstep(0.0, 0.1, slope);',
				'final_color = mix(final_color, mountain, slope);',

				// 'final_color = vec4(1.0);',
				// 'final_color = vec4(N, 1.0);',

				ShaderBuilder.light.fragment,

				// 'final_color.rgb += totalSpecular;',
				// 'final_color.a += min(length(totalSpecular), 1.0);',

				'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
				'final_color.rgb = mix(final_color.rgb, fogColor, d);',

				'gl_FragColor = final_color;',
				'}'
			].join('\n');
		}
	};

	return Terrain;
});