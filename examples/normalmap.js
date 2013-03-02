require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
		'goo/lib': '../lib'
	}
});
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/loaders/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/renderer/Texture', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/math/Vector3',
		'goo/scripts/BasicControlScript', 'goo/renderer/shaders/ShaderFragments', 'goo/scripts/OrbitCamControlScript',
		'goo/renderer/shaders/ShaderLib', 'goo/util/TangentGenerator', 'goo/shapes/Sphere', 'goo/renderer/light/PointLight', 'goo/entities/components/LightComponent'], 
		function(World, Entity, System, TransformSystem, RenderSystem,
	TransformComponent, MeshDataComponent, MeshRendererComponent, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3,
	BasicControlScript, ShaderFragments, OrbitCamControlScript, ShaderLib, TangentGenerator, Sphere, PointLight, LightComponent) {
	"use strict";

	var resourcePath = "../resources";

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);
		goo.renderer.setClearColor(0,0,0,1);

		// Add box
		var boxEntity = createBoxEntity(goo);
		boxEntity.addToWorld();
		
		var floorEntity = createBox(goo, 1000, 1, ShaderLib.texturedLit);
		floorEntity.transformComponent.transform.translation.y = -50;
		floorEntity.addToWorld();

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(10, 20, 20);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(50, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);
	
		var entity = createBox(goo, 1, 1, ShaderLib.simple);
		entity.setComponent(new LightComponent(new PointLight()));
		entity.addToWorld();
		var script = {
			run: function (entity) {
				var t = entity._world.time;

				var transformComponent = entity.transformComponent;
				transformComponent.transform.translation.x = Math.sin(t * 1.0) * 20;
				transformComponent.transform.translation.y = 10;
				transformComponent.transform.translation.z = Math.cos(t * 1.0) * 20;
				transformComponent.setUpdated();
			}
		};
		entity.setComponent(new ScriptComponent(script));
	}

	function createBox(goo, w, h, shader) {
		var meshData = ShapeCreator.createBox(w, h, w, 10, 10);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.name = "Floor";

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(shader, 'Floorhader');

		var texture = new TextureCreator().loadTexture2D(resourcePath + '/fieldstone-c.jpg');
		material.textures.push(texture);

		entity.meshRendererComponent.materials.push(material);

		return entity;
	}
	
	function createBoxEntity(goo) {
		var meshData = ShapeCreator.createSphere(32, 32, 10); //, Sphere.TextureModes.Projected
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.name = "Sphere";
		
		TangentGenerator.addTangentBuffer(meshData, 0);

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(createShaderDef(), 'CubeShader');

		var texture = new TextureCreator().loadTexture2D(resourcePath + '/fieldstone-c.jpg');
		material.textures.push(texture);

		var normalmap = new TextureCreator().loadTexture2D(resourcePath + '/fieldstone-n.jpg');
		material.textures.push(normalmap);

		var environmentPath = resourcePath + '/environment/';
		var textureCube = new TextureCreator().loadTextureCube([
		                                                        environmentPath + 'envmap_left.jpg',
		                                                        environmentPath + 'envmap_right.jpg',
		                                                        environmentPath + 'envmap_bottom.jpg',
		                                                        environmentPath + 'envmap_top.jpg',
		                                                        environmentPath + 'envmap_back.jpg',
		                                                        environmentPath + 'envmap_front.jpg',
		                                                        ]);
		material.textures.push(textureCube);

		entity.meshRendererComponent.materials.push(material);

		return entity;
	}

	function createShaderDef() {
		return {
			attributes : {
				vertexPosition : MeshData.POSITION,
				vertexUV0 : MeshData.TEXCOORD0,
				vertexNormal : MeshData.NORMAL,
				vertexTangent : MeshData.TANGENT
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				cameraPosition : Shader.CAMERA,
				lightPosition : Shader.LIGHT0,
				diffuseMap : Shader.TEXTURE0,
				normalMap : Shader.TEXTURE1,
				cubeMap : Shader.TEXTURE2
			},
			vshader : [ //
			'attribute vec3 vertexPosition;', //
			'attribute vec2 vertexUV0;', //
			'attribute vec3 vertexNormal;', //
			'attribute vec4 vertexTangent;', //

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//
			'uniform vec3 cameraPosition;', //
			'uniform vec3 lightPosition;', //

			'varying vec2 texCoord0;',//
			'varying vec3 eyeVec;',//
			'varying vec3 lightVec;',//
			'varying mat3 rotInv;',

			'void main(void) {', //
			'	texCoord0 = vertexUV0;',//

			'	vec3 worldPos = (worldMatrix * vec4(vertexPosition, 1.0)).xyz;',

			'	mat3 normalMatrix = mat3(worldMatrix);',
			
			'	vec3 n = normalize(normalMatrix * vertexNormal);',
			'	vec3 t = normalize(normalMatrix * vertexTangent.xyz);',
			'	vec3 b = cross(n, t) * vertexTangent.w;',
			'	mat3 rotMat = mat3(t, b, n);',
			'	rotInv = rotMat;',

			'	vec3 eyeDir = worldPos - cameraPosition;',
			'	eyeVec = eyeDir * rotMat;',

			'	vec3 lightDir = lightPosition - worldPos;',
			'	lightVec = lightDir * rotMat;',

			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'uniform sampler2D diffuseMap;',//
			'uniform sampler2D normalMap;',//
			'uniform samplerCube cubeMap;',//

			'varying vec2 texCoord0;',//
			'varying vec3 eyeVec;',//
			'varying vec3 lightVec;',//
			'varying mat3 rotInv;',

			'void main(void)',//
			'{',//
			'	vec4 tex = texture2D(diffuseMap, texCoord0);',//
			'	vec3 bump = texture2D(normalMap, texCoord0).rgb * 2.0 - 1.0;',//
			
			'	float diffuse = max( dot(normalize(lightVec), bump) * 0.8 + 0.2, 0.0 ) + 0.2;',
			'	vec4 diffuseCol = vec4(1.0) * diffuse;',

			'	bump = normalize(bump * vec3(1.0, 1.0, 4.0));',

			'	vec3 refl = -reflect(normalize(eyeVec), bump);', //
			'	refl = rotInv * refl;',
			'	vec4 cube = textureCube(cubeMap, refl);',//
			
			'	gl_FragColor = tex * diffuseCol + cube;',//
			'}',//
			].join('\n')
		};
	}

	init();
});
