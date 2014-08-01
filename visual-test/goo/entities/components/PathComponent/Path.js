define([
	'goo/entities/Entity',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/geometrypack/PolyLine',
	'PathAnchor'
], function (
	Entity,
	TransformComponent,
	MeshRendererComponent,
	MeshDataComponent,
	Material,
	ShaderLib,
	PolyLine,
	PathAnchor
) {
	function Path(world) {
		Entity.apply(this, arguments);

		var transformComponent = new TransformComponent();
		this.setComponent(transformComponent);

		var meshDataComponent = new MeshDataComponent();
		this.setComponent(meshDataComponent);

		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(new Material(ShaderLib.simpleColored));
		this.setComponent(meshRendererComponent);

		this._anchors = [];
	}
	Path.prototype = Object.create(Entity.prototype);
	Path.prototype.constructor = Path;


	Path.prototype.update = function () {
		var spline = [];
		var numAnchors = this._anchors.length;

		for (var i = 0; i < numAnchors; ++i) {
			var anchor = this._anchors[i];
			anchor.update();

			if (i !== 0) {
				pushAll(spline, anchor.getBeforeControlPoint());
			}

			pushAll(spline, anchor.getAnchorControlPoint());

			if (i < numAnchors - 1) {
				pushAll(spline, anchor.getAfterControlPoint());
			}
		}

		var meshData = PolyLine.fromCubicSpline(spline, 40);
		this.meshDataComponent.meshData = meshData;
	};


	Path.prototype.addAnchor = function (pos) {
		var anchor = new PathAnchor(this._world).addToWorld();
		this.attachChild(anchor);
		anchor.setTranslation(pos);
		this._anchors.push(anchor);
	};


	Path.prototype.removeAnchor = function (anchor) {

	};


	function pushAll(dest, items) {
		Array.prototype.push.apply(dest, items);
	}


	return Path;
});