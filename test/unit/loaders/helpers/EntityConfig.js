define([
	'goo/util/ObjectUtil'
], function (
	_
) {
	'use strict';

	return {
		entity: function (components) {
			components = components || ['transform'];
			var entity = this.gooObject('entity', 'Dummy');
			entity.components = {};
			for (var i = 0; i < components.length; i++) {
				entity.components[components[i]] = this.component[components[i]]();
			}
			this.addToBundle(entity);
			return entity;
		},
		component: {
			transform: function (translation, rotation, scale) {
				translation = translation ? translation.slice() : [0, 0, 0];
				rotation = rotation ? rotation.slice() : [0, 0, 0];
				scale = scale ? scale.slice() : [1, 1, 1];

				return {
					translation: translation,
					rotation: rotation,
					scale: scale
				};
			},
			camera: function (aspect, lockedRatio, far, fov, near) {
				return {
					aspect: aspect || 1,
					lockedRatio: !!lockedRatio,
					far: far || 1000,
					fov: fov || 45,
					near: near || 1
				};
			},
			light: function (type, options) {
				var config = _.copyOptions({}, options, {
					type: type || 'PointLight',
					color: [1, 1, 1],
					intensity: 1,
					shadowCaster: false,
					specularIntensity: 1
				});
				if (type !== 'DirectionalLight') {
					config.range = config.range || 1000;
				}
				if (type === 'SpotLight') {
					config.angle = config.angle || 55;
				}
				if (config.shadowCaster) {
					config.shadowSettings = config.shadowSettings || {};
					_.defaults(config.shadowSettings, {
						type: 'Blur',
						projection: (config.type === 'DirectionalLight') ? 'Parallel' : 'Perspective',
						near: 1,
						far: 1000,
						resolution: [512, 512],
						upVector: [0, 1, 0],
						darkness: 0.5
					});
				}
				return config;
			},
			animation: function () {
				return {
					layersRef: this.animation().id,
					poseRef: this.skeleton().id
				};
			},
			particle: function () {
				return {
					// TODO
				};
			},
			meshRenderer: function () {
				var config = {
					cullMode: 'Dynamic',
					castShadows: true,
					receiveShadow: true,
					reflectable: true,
					materials: {}
				};
				for (var i = 2; i >= 0; i--) {
					var material = this.material();
					config.materials[material.id] = {
						sortValue: Math.random(),
						materialRef: material.id
					};
				}
				return config;
			},
			meshData: function (shape, options) {
				if (shape) {
					return {
						shape: shape,
						shadeOptions: options
					};
				}
				return {
					meshRef: this.mesh().id,
					poseRef: this.skeleton().id
				};
			},
			timeline: function () {
				return {
					channels: {
						'c1': {
							id: 'c1',
							sortValue: 0,
							propertyKey: 'scaleX',
							keyframes: {
								'k1': {
									time: 10,
									value: 20,
									easing: 'Linear.None'
								},
								'k2': {
									time: 100,
									value: 50,
									easing: 'Linear.None'
								},
								'k3': {
									time: 200,
									value: 50,
									easing: 'Linear.None'
								}
							}
						},
						'c2': {
							id: 'c2',
							sortValue: 1,
							propertyKey: 'translationY',
							keyframes: {
								'k1': {
									time: 200,
									value: 20,
									easing: 'Linear.None'
								},
								'k2': {
									time: 100,
									value: 50,
									easing: 'Linear.None'
								}
							}
						}
					},
					loop: {
						enabled: false
					}
				};
			},
			quad: function () {
				return {
					materialRef: this.material().id
				};
			},
			html: function () {
				return {
					innerHTML: 'some html'
				};
			},
			collider: function (type) {
				return _.defaults({}, {
					shape: type || 'Box', // Box, Cylinder, Plane, Sphere
					isTrigger: false,
					friction: 0.3,
					restitution: 0.0,
					shapeOptions: {
						halfExtents: [1, 1, 1], // Box
						radius: 0.5, // Sphere, Cylinder
						height: 1 // Cylinder
					}
				});
			},
			rigidBody: function () {
				return {
					mass: 1,
					isKinematic: false,
					velocity: [0, 0, 0],
					angularVelocity: [0, 0, 0],
					linearDrag: 0,
					angularDrag: 0
				};
			}
		},
		attachChild: function (parent, child) {
			if (!parent.components.transform.children) {
				parent.components.transform.children = {};
			}
			var size = Object.keys(parent.components.transform.children).length;
			parent.components.transform.children[child.id] = {
				entityRef: child.id,
				sortValue: size
			};
		}
	};
});
