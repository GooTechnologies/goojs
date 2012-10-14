//require.config({
//	paths : {
//		"three" : "three.min"
//	}
//});

require([ 'entities/World', 'entities/Entity', 'entities/systems/System', 'entities/systems/TransformSystem',
		'entities/systems/RenderSystem', 'entities/components/TransformComponent',
		'entities/components/MeshDataComponent', 'entities/components/MeshRendererComponent',
		'entities/systems/PartitioningSystem', 'renderer/MeshData', 'renderer/Renderer', 'renderer/Material',
		'renderer/Shader', 'renderer/DataMap', 'entities/GooRunner' ], function(World, Entity, System, TransformSystem,
		RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData,
		Renderer, Material, Shader, DataMap, GooRunner) {

	function init() {
		var goo = new GooRunner();
		document.body.appendChild(goo.renderer.domElement);

		var triangleEntity = createTriangleEntity(goo.world);
		triangleEntity.addToWorld();
	}

	function createTriangleEntity(world) {
		var dataMap = DataMap.defaultMap([ 'POSITION' ]);
		var meshData = new MeshData(dataMap, 4, 6);
		meshData.getAttributeBuffer('POSITION').set([ 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0 ]);
		meshData.getIndexBuffer().set([ 0, 1, 3, 1, 2, 3 ]);

		var entity = world.createEntity();

		var transformComponent = new TransformComponent();
		entity.setComponent(transformComponent);

		var meshDataComponent = new MeshDataComponent(meshData);
		entity.setComponent(meshDataComponent);

		var meshRendererComponent = new MeshRendererComponent();
		var material = new Material('TestMaterial');
		var vs = [ //
		'attribute vec3 position; //!POSITION', //
		'void main() {', //
		'gl_Position = vec4(position,1.0);', //
		'}' //
		].join('\n');
		var fs = [ //
		'void main() {', //
		'gl_FragColor = vec4(1.0,0.0,0.0,1.0);', //
		'}' //
		].join('\n');
		material.shader = new Shader('TestShader', vs, fs);
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		return entity;
	}

	init();
});
