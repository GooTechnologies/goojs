define([
	'goo/entities/Entity',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/geometrypack/PolyLine',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
], function (
	Entity,
	TransformComponent,
	MeshRendererComponent,
	MeshDataComponent,
	Material,
	ShaderLib,
	PolyLine,
	Sphere,
	Box
) {
	function PathAnchorControl(world, id, name) {
		Entity.apply(this, arguments);

		var transformComponent = new TransformComponent();
		this.setComponent(transformComponent);

		var size = PathAnchorControl.SIZE;
		var meshDataComponent = new MeshDataComponent(new Box(size, size, size));
		this.setComponent(meshDataComponent);

		var color = [0.2, 0.2, 0.2];

		var meshRendererComponent = new MeshRendererComponent();
		var material = new Material(ShaderLib.simpleColored);
		material.uniforms.color = color;
		meshRendererComponent.materials.push(material);
		this.setComponent(meshRendererComponent);

		var lineMaterial = new Material(ShaderLib.simpleColored);
		lineMaterial.uniforms.color = color;
		this._line = world.createEntity(lineMaterial).addToWorld();
		this._line.setComponent(new MeshDataComponent());
		this.attachChild(this._line);

		this._updateLine();
	}
	PathAnchorControl.prototype = Object.create(Entity.prototype);
	PathAnchorControl.prototype.constructor = PathAnchorControl;


	PathAnchorControl.prototype.update = function () {
		this._updateLine();
	};


	PathAnchorControl.prototype._updateLine = function () {
		var t = this.getTranslation();
		this._line.meshDataComponent.meshData = new PolyLine([
			0, 0, 0,
			-t[0], -t[1], -t[2]
		]);
	};

	function vecToArray(value) {
		return [value[0], value[1], value[2]];
	}


	PathAnchorControl.SIZE = 0.08;

	return PathAnchorControl;
});