require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
		'goo/lib': '../lib'
	}
});
require([
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/entities/GooRunner',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/shapes/ShapeCreator',
	'goo/entities/EntityUtils',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/math/Vector3',
	'goo/renderer/shaders/ShaderFragment',
	'goo/scripts/OrbitCamControlScript'
	//'goo/renderer/shaders/ShaderLib'
], function (
	MeshData,
	Material,
	Shader,
	GooRunner,
	TextureCreator,
	ScriptComponent,
	ShapeCreator,
	EntityUtils,
	Camera,
	CameraComponent,
	Vector3,
	ShaderFragment,
	OrbitCamControlScript
	//ShaderLib
) {
	"use strict";

	var resourcePath = "../resources";

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			//showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		goo.renderer.setClearColor(0, 0, 0, 1);
		document.body.appendChild(goo.renderer.domElement);

		// Add box
		var boxEntity = createBoxEntity(goo);
		boxEntity.addToWorld();

		//var floorEntity = createFloor(goo);
		//floorEntity.addToWorld();

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
	}

	/*function createFloor(goo) {
		var meshData = ShapeCreator.createBox(1000, 1, 1000, 10, 10);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.transformComponent.transform.translation.y = -50;
		entity.name = "Floor";

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(ShaderLib.textured, 'Floorhader');

		var texture = new TextureCreator().loadTexture2D(resourcePath + '/fieldstone-c.jpg');
		material.textures.push(texture);

		entity.meshRendererComponent.materials.push(material);

		return entity;
	}*/

	function createBoxEntity(goo) {
		var meshData = ShapeCreator.createSphere(32, 32, 10);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.name = "Box";

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(createShaderDef(), 'CubeShader');

		var texture = new TextureCreator().loadTexture2D(resourcePath + '/pitcher.jpg');
		material.textures.push(texture);

		var environmentPath = resourcePath + '/environment/';
		var textureCube = new TextureCreator().loadTextureCube([
		                                                        environmentPath + 'envmap_left.jpg',
		                                                        environmentPath + 'envmap_right.jpg',
		                                                        environmentPath + 'envmap_bottom.jpg',
		                                                        environmentPath + 'envmap_top.jpg',
		                                                        environmentPath + 'envmap_back.jpg',
		                                                        environmentPath + 'envmap_front.jpg'
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
				vertexNormal : MeshData.NORMAL
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				cameraPosition : Shader.CAMERA,
				diffuseMap : Shader.TEXTURE0,
				cubeMap : Shader.TEXTURE1
			},
			vshader : [ //
			'attribute vec3 vertexPosition;', //
			'attribute vec2 vertexUV0;', //
			'attribute vec3 vertexNormal;', //

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//
			'uniform vec3 cameraPosition;', //

			'varying vec2 texCoord0;',//
			'varying vec3 texCoord1;',//

			'void main(void) {', //
			'	texCoord0 = vertexUV0;',//
			'	vec3 eyeDir = normalize(cameraPosition - (worldMatrix * vec4(vertexPosition, 1.0)).xyz);',
			'	vec3 normal = normalize(mat3(worldMatrix) * vertexNormal);',
			'	texCoord1 = reflect(eyeDir, normal);', //
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'uniform sampler2D diffuseMap;',//
			'uniform samplerCube cubeMap;',//

			'varying vec2 texCoord0;',//
			'varying vec3 texCoord1;',//

			'void main(void)',//
			'{',//
			'	vec4 tex = texture2D(diffuseMap, texCoord0);',//
			'	vec4 cube = textureCube(cubeMap, texCoord1);',//
			'	gl_FragColor = tex + cube;',//
			'}'//
			].join('\n')
		};
	}

	init();
});
