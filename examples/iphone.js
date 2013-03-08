require.config({
    baseUrl : "./",
    paths : {
        goo : "../src/goo",
        'goo/lib': '../lib'
    }
});
require([
	'goo/entities/World',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/entities/GooRunner',
	'goo/renderer/TextureCreator',
	'goo/loaders/JSONImporter',
	'goo/entities/components/ScriptComponent',
	'goo/entities/components/LightComponent',
	'goo/renderer/light/PointLight',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3'
], function (
	World,
	MeshData,
	Material,
	Shader,
	GooRunner,
	TextureCreator,
	JSONImporter,
	ScriptComponent,
	LightComponent,
	PointLight,
	Camera,
	CameraComponent,
	OrbitCamControlScript,
	Vector3
) {
	"use strict";

	var resourcePath = "../resources";
	var iphone;
	function init() {
		var goo = new GooRunner({
			showStats : true,
			antialias : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		goo.renderer.setClearColor(0.7, 0.7, 0.65, 1);

		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(20, -Math.PI / 2, Math.PI / 4),
			maxZoomDistance : 100
		}));
		cameraEntity.setComponent(scripts);

		// Setup light
		var light = new PointLight();
		var entity = goo.world.createEntity('Light1');
		entity.setComponent(new LightComponent(light));
		var transformComponent = entity.transformComponent;
		transformComponent.transform.translation.x = 10;
		transformComponent.transform.translation.y = 10;
		transformComponent.transform.translation.z = 10;
		entity.addToWorld();

		// Examples of model loading
		iphone = loadIphone(goo);
	}

	function loadIphone(goo) {
		var importer = new JSONImporter(goo.world);

		var topEntity = goo.world.createEntity('IPhone');
		topEntity.addToWorld();

		var environmentPath = resourcePath + '/environment/';
		var textureCube = new TextureCreator().loadTextureCube([
		                                                        environmentPath + 'envmap_left.jpg',
		                                                        environmentPath + 'envmap_right.jpg',
		                                                        environmentPath + 'envmap_bottom.jpg',
		                                                        environmentPath + 'envmap_top.jpg',
		                                                        environmentPath + 'envmap_back.jpg',
		                                                        environmentPath + 'envmap_front.jpg'
		                                                        ]);
		var shader = Material.createShader(createShaderDef(), 'CubeShader');

		importer.load(resourcePath + '/iphone/iphone.json', resourcePath + '/iphone/textures/', {
			onSuccess : function(entities) {
				for (var i in entities) {
					console.log(entities[i].name);
					entities[i].addToWorld();

					var meshRendererComponent = entities[i].meshRendererComponent;
					if (meshRendererComponent) {
						meshRendererComponent.materials[0].textures[1] = textureCube;
						meshRendererComponent.materials[0].shader = shader;

						if (entities[i].name === 'Screen_meshShape[phongE2SG]') {
							var texture = new TextureCreator().loadTextureWebCam();
							meshRendererComponent.materials[0].textures[0] = texture;
						}
					}
				}
				topEntity.transformComponent.attachChild(entities[0].transformComponent);
			},
			onError : function(error) {
				console.error(error);
			}
		});

		return topEntity;
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
				lightPosition : Shader.LIGHT0,
				diffuseMap : Shader.TEXTURE0,
				cubeMap : Shader.TEXTURE1,
				materialAmbient : Shader.AMBIENT,
				materialEmissive : Shader.EMISSIVE,
				materialDiffuse : Shader.DIFFUSE,
				materialSpecular : Shader.SPECULAR,
				materialSpecularPower : Shader.SPECULAR_POWER
			},
			vshader : [ //
			'attribute vec3 vertexPosition;', //
			'attribute vec2 vertexUV0;', //
			'attribute vec3 vertexNormal;', //

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//
			'uniform vec3 cameraPosition;', //
			'uniform vec3 lightPosition;', //

			'varying vec3 normal;',//
			'varying vec3 lightDir;',//
			'varying vec3 eyeVec;',//
			'varying vec2 texCoord0;',//
			'varying vec3 texCoord1;',//

			'void main(void) {', //
			'	texCoord0 = vertexUV0;',//
			'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);', //

			'	lightDir = lightPosition - worldPos.xyz;', //
			'	eyeVec = cameraPosition - worldPos.xyz;', //

			'	normal = normalize(mat3(worldMatrix) * vertexNormal);',
			'	texCoord1 = reflect(normalize(-eyeVec), normal);', //
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'uniform sampler2D diffuseMap;',//
			'uniform samplerCube cubeMap;',//

			'uniform vec4 materialAmbient;',//
			'uniform vec4 materialEmissive;',//
			'uniform vec4 materialDiffuse;',//
			'uniform vec4 materialSpecular;',//
			'uniform float materialSpecularPower;',//

			'varying vec3 normal;',//
			'varying vec3 lightDir;',//
			'varying vec3 eyeVec;',//
			'varying vec2 texCoord0;',//
			'varying vec3 texCoord1;',//

			'void main(void)',//
			'{',//
			'	vec4 texCol = texture2D(diffuseMap, texCoord0);',//
			'	vec4 cube = textureCube(cubeMap, texCoord1);',//

			'	vec4 final_color = max(materialAmbient, materialEmissive);',//

			'	vec3 N = normalize(normal);',//
			'	vec3 L = normalize(lightDir);',//

			'	float lambertTerm = dot(N,L)*0.75+0.25;',//

			'	if(lambertTerm > 0.0)',//
			'	{',//
			'		final_color += materialDiffuse * // gl_LightSource[0].diffuse * ',//
			'			lambertTerm;',//
			'		vec3 E = normalize(eyeVec);',//
			'		vec3 R = reflect(-L, N);',//
			'		float specular = pow( max(dot(R, E), 0.0), materialSpecularPower);',//
			'		final_color += materialSpecular * // gl_LightSource[0].specular * ',//
			'			specular;',//
			'		final_color = clamp(final_color, vec4(0.0), vec4(1.0));',//
			'	}',//
			'	gl_FragColor = vec4(texCol.rgb * final_color.rgb + cube.rgb, 1.0);',//
			'}'//
			].join('\n')
		};
	}

	init();
});
