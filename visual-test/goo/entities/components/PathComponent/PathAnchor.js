define([
	'goo/entities/Entity',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'PathAnchorControl',
], function (
	Entity,
	TransformComponent,
	MeshRendererComponent,
	MeshDataComponent,
	Material,
	ShaderLib,
	Box,
	PathAnchorControl
) {
	function PathAnchor(world) {
		Entity.apply(this, arguments);

		var transformComponent = new TransformComponent();
		this.setComponent(transformComponent);

		var size = PathAnchor.SIZE;
		var meshDataComponent = new MeshDataComponent(new Box(size, size, size));
		this.setComponent(meshDataComponent);

		var meshRendererComponent = new MeshRendererComponent();
		var material = new Material(ShaderLib.simpleLit);
		material.uniforms.materialDiffuse = [41 / 255, 131 / 255, 204 / 255, 1];
		meshRendererComponent.materials.push(material);
		this.setComponent(meshRendererComponent);

		this._createControls(world);
	}
	PathAnchor.prototype = Object.create(Entity.prototype);
	PathAnchor.prototype.constructor = PathAnchor;


	PathAnchor.prototype._createControls = function (world) {
		this._controlBefore = new PathAnchorControl(world).addToWorld();
		this._controlBefore.setTranslation([0, 1, 0]);
		this.attachChild(this._controlBefore);

		this._controlAfter = new PathAnchorControl(world).addToWorld();
		this._controlAfter.setTranslation([0, -1, 0]);
		this.attachChild(this._controlAfter);
	};


	PathAnchor.prototype.update = function () {
		this._controlAfter.update();
		this._controlBefore.update();
	};


	PathAnchor.prototype.getBeforeControlPoint = function () {
		return this._getControlPoint(this._controlBefore);
	};


	PathAnchor.prototype.getAfterControlPoint = function () {
		return this._getControlPoint(this._controlAfter);
	};


	PathAnchor.prototype.getAnchorControlPoint = function () {
		return this._getControlPoint(this);
	};


	PathAnchor.prototype._getControlPoint = function (entity) {
		var t = entity.transformComponent.worldTransform.translation;
		return [t[0], t[1], t[2]];
	};


	PathAnchor.SIZE = 0.2;


	return PathAnchor;
});