define([ 'entities/World', 'entities/Entity', 'entities/systems/System', 'entities/systems/TransformSystem',
		'entities/systems/RenderSystem', 'entities/components/TransformComponent',
		'entities/components/MeshDataComponent', 'entities/components/MeshRendererComponent',
		'entities/systems/PartitioningSystem', 'renderer/MeshData', 'renderer/Renderer', 'renderer/Material',
		'renderer/Shader', 'renderer/DataMap' ], function(World, Entity, System, TransformSystem, RenderSystem,
		TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material,
		Shader, DataMap) {
	function GooRunner() {
		this.world = new World();
		this.renderer = new Renderer();

		this.world.setSystem(new TransformSystem());

		var renderList = [];
		var partitioningSystem = new PartitioningSystem(renderList);
		this.world.setSystem(partitioningSystem);
		var renderSystem = new RenderSystem(renderList);
		this.world.setSystem(renderSystem);

		this.init();
		// this.run();
		window.requestAnimationFrame(run);

		var that = this;
		var start = Date.now();
		function run(time) {
			that.world.tpf = time - start;
			that.world.process();
			renderSystem.render(that.renderer);

			window.requestAnimationFrame(run);
		}
	}

	GooRunner.prototype.init = function() {
		var lastTime = 0;
		var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

		for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
					|| window[vendors[x] + 'CancelRequestAnimationFrame'];
		}

		if (window.requestAnimationFrame === undefined) {
			window.requestAnimationFrame = function(callback, element) {
				var currTime = Date.now(), timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() {
					callback(currTime + timeToCall);
				}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}

		if (window.cancelAnimationFrame === undefined) {
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		}
	};

	return GooRunner;
});