define([
	'goo/util/ObjectUtil'
], function(
	_
) {
	'use strict';

	return {
		scene: function(complex) {
			var entities = {};
			var components = complex ? ['transform', 'meshRenderer', 'meshData', 'animation', 'camera', 'light']: null;
			for (var i = 0; i < 5; i++) {
				var entity = this.entity(components);
				entities[entity.id] = {
					sortValue: i,
					entityRef: entity.id
				};
			}
			var scene = this.gooObject('scene', 'Dummy');
			scene.entities = entities;
			return scene;
		},
		project: function(complex) {
			var project = this.gooObject('project', 'Dummy');
			project.scenes = {};

			var sceneWrapper;
			for (var i = 0; i < 3; i++) {
				var scene = this.scene(complex);
				sceneWrapper = {
					sortValue: Math.random(),
					sceneRef: scene.id
				};
				project.scenes[scene.id] = sceneWrapper;
			}
			project.mainSceneRef = sceneWrapper.sceneRef;
			return project;
		},
		skybox: function(type) {
			var config = this.gooObject('skybox', 'Dummy');
			if (type === 'sphere') {
				config.sphere = {
					enabled: true,
					sphereRef: this.texture().id
				};
			} else {
				config.box = {
					enabled: true,
					topRef: this.texture().id,
					bottomRef: this.texture().id,
					leftRef: this.texture().id,
					rightRef: this.texture().id,
					frontRef: this.texture().id,
					backRef: this.texture().id
				};
			}
			return config;
		},
		environment: function() {
			var config = this.gooObject('environment', 'Dummy');
			_.extend(config, {
				backgroundColor: [1,1,1],
				globalAmbient: [0.5,0.5,0.5],
				skyboxRef: this.skybox().id,
				fog: {
					enabled: true,
					color: [1,0,0],
					near: 1,
					far: 100
				},
				weather: {
					snow: {
						velocity: 10,
						rate: 2,
						enabled: true,
						height: 100
					}
				}
			});
			return config;
		}
	};
});