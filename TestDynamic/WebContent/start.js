require([ 'goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System',
		'goo/entities/systems/TransformSystem', 'goo/entities/systems/RenderSystem',
		'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem',
		'goo/renderer/MeshData', 'goo/renderer/Renderer', 'goo/renderer/Material', 'goo/renderer/Shader',
		'goo/renderer/DataMap', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter' ], function(World, Entity, System, TransformSystem, RenderSystem,
		TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material,
		Shader, DataMap, GooRunner, TextureCreator, Loader, JSONImporter) {

	function init() {
		// Create typical goo application
		var goo = new GooRunner();
		document.body.appendChild(goo.renderer.domElement);

		var importer = new JSONImporter(goo.world);
		importer.import('resources/girl.model');

		// Add quad
		var quadEntity = createQuadEntity(goo);
		quadEntity.addToWorld();
	}

	function createQuadEntity(goo) {
		var world = goo.world;

		// Create simple quad
		var dataMap = DataMap.defaultMap([ 'POSITION', 'COLOR', 'TEXCOORD0' ]);
		var meshData = new MeshData(dataMap, 4, 6);
		meshData.getAttributeBuffer('POSITION').set([ -5, -5, 0, -5, 5, 0, 5, 5, 0, 5, -5, 0 ]);
		meshData.getAttributeBuffer('COLOR').set(
				[ 1.0, 0.5, 0.5, 1.0, 0.5, 1.0, 0.5, 1.0, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, ]);
		meshData.getAttributeBuffer('TEXCOORD0').set([ 0, 0, 0, 1, 1, 1, 1, 0 ]);
		meshData.getIndexBuffer().set([ 0, 1, 3, 1, 2, 3 ]);

		// Create entity
		var entity = world.createEntity();

		// Create transform component
		var transformComponent = new TransformComponent();
		entity.setComponent(transformComponent);

		// Create meshdata component using above data
		var meshDataComponent = new MeshDataComponent(meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		var material = new Material('TestMaterial');

		var vs = getShader('vshader');
		var fs = getShader('fshader');

		material.shader = new Shader('TestShader', vs, fs);

		var texture = new TextureCreator().loadTexture2D('resources/pitcher.jpg');
		material.textures.push(texture);

		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		// var t = 0;
		// material.shader.bindCallback('dostuff',
		// function(uniformMapping,
		// shaderInfo) {
		// uniformMapping['time'].uniform1f(t);
		// t += world.tpf;
		// });

		var t = 0;
		goo.callbacks.push(function(tpf) {
			transformComponent.transform.translation.x = Math.sin(t * 2) * 5;
			transformComponent.transform.rotation.x = Math.sin(t) * 2;
			transformComponent.transform.rotation.y = Math.sin(t * 1.5) * 3;
			t += tpf;
		});

		return entity;
	}

	function getShader(id) {
		var shaderScript = document.getElementById(id);
		if (!shaderScript) {
			return null;
		}

		var str = "";
		var k = shaderScript.firstChild;
		while (k) {
			if (k.nodeType == 3) {
				str += k.textContent;
			}
			k = k.nextSibling;
		}

		return str;
	}

	init();
});
