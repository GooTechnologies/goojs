import System from '../../entities/systems/System';
import Material from '../../renderer/Material';
import ShaderLib from '../../renderer/shaders/ShaderLib';
import MarkerComponent from '../../debugpack/components/MarkerComponent';
import Renderer from '../../renderer/Renderer';
import Transform from '../../math/Transform';



	/**
	 * Processes all entities with a marker component
	 * @extends System
	 */
	function MarkerSystem(goo) {
		System.call(this, 'MarkerSystem', ['MarkerComponent']);

		this.material = new Material(ShaderLib.simpleColored);
		this.material.depthState.enabled = false;
		this.material.shader.uniforms.color = [0.0, 1.0, 0.0];

		this.goo = goo;
		this.renderer = this.goo.renderer;

		this.entities = [];

		// drawing needs to be performed AFTER the render system completes its execution
		this.goo.callbacks.push(function () {
			for (var i = 0; i < this.entities.length; i++) {
				var entity = this.entities[i];
				if (entity.hasComponent('MarkerComponent')) {
					var transform = new Transform();
					transform.copy(entity.transformComponent.worldTransform);
					transform.setRotationXYZ(0, 0, 0);
					transform.scale.setDirect(1, 1, 1);
					transform.update();

					var renderableMarker = {
						meshData: entity.markerComponent.meshData,
						materials: [this.material],
						transform: transform
					};

					this.goo.renderer.render(renderableMarker, Renderer.mainCamera, [], null, false);
				}
			}
		}.bind(this));
	}

	MarkerSystem.prototype = Object.create(System.prototype);

	MarkerSystem.prototype.process = function (entities) {
		this.entities = entities;
	};

	export default MarkerSystem;