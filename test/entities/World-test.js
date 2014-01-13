define([
	'goo/entities/World',
	'goo/entities/systems/System',
	'goo/entities/components/Component',
	'goo/shapes/Box',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/renderer/light/PointLight',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/LightComponent',
	'goo/entities/components/ScriptComponent',
	'goo/entities/Entity',
	'goo/entities/systems/TransformSystem',
	'goo/entities/managers/Manager'
], function(
	World,
	System,
	Component,
	Box,
	Material,
	ShaderLib,
	Camera,
	PointLight,
	TransformComponent,
	MeshDataComponent,
	MeshRendererComponent,
	CameraComponent,
	LightComponent,
	ScriptComponent,
	Entity,
	TransformSystem,
	Manager
) {
	'use strict';

	describe('World with Systems', function() {
		var world;
		beforeEach(function() {
			world = new World();
			world.registerComponent(TransformComponent);
			world.registerComponent(MeshDataComponent);
			world.registerComponent(MeshRendererComponent);
			world.registerComponent(CameraComponent);
			world.registerComponent(LightComponent);
		});

		it ('adds a system with default priority to the world', function() {
			var systemA = { type: 'A', priority: 0 };
			var systemB = { type: 'B', priority: 0 };

			world.setSystem(systemA);
			world.setSystem(systemB);

			expect(world._systems).toEqual([systemA, systemB]);
		});
		it ('adds a system with high priority to the world', function() {
			var systemA = { type: 'A', priority: 0 };
			var systemB = { type: 'B', priority: 0 };
			var systemC = { type: 'B', priority: -1 };

			world.setSystem(systemA);
			world.setSystem(systemB);
			world.setSystem(systemC);

			expect(world._systems).toEqual([systemC, systemA, systemB]);
		});
		it ('adds a system with low priority to the world', function() {
			var world = new World();

			var systemA = { type: 'A', priority: 0 };
			var systemB = { type: 'B', priority: 0 };
			var systemC = { type: 'C', priority: 5 };

			world.setSystem(systemA);
			world.setSystem(systemB);
			world.setSystem(systemC);

			expect(world._systems).toEqual([systemA, systemB, systemC]);
		});
		it ('adds a system with medium priority to the world', function() {
			var systemA = { type: 'A', priority: 3 };
			var systemB = { type: 'B', priority: 1 };
			var systemC = { type: 'C', priority: 2 };

			world.setSystem(systemA);
			world.setSystem(systemB);
			world.setSystem(systemC);

			expect(world._systems).toEqual([systemB, systemC, systemA]);
		});
	});

	describe('World with Components', function() {
		var world;
		beforeEach(function() {
			world = new World();
			world.registerComponent(TransformComponent);
			world.registerComponent(MeshDataComponent);
			world.registerComponent(MeshRendererComponent);
			world.registerComponent(CameraComponent);
			world.registerComponent(LightComponent);
			world.registerComponent(ScriptComponent);
		});

		// Cucumber system
		function CucumberSystem() {
			System.call(this, 'CucumberSystem', ['CucumberComponent']);
		}
		CucumberSystem.prototype = Object.create(System.prototype);
		CucumberSystem.prototype.inserted = function() {};
		CucumberSystem.prototype.deleted = function() {};
		CucumberSystem.prototype.addedComponent = function() {};
		CucumberSystem.prototype.removedComponent = function() {};

		// Cucumber component
		function CucumberComponent() {
			this.type = 'CucumberComponent';
		}

		var cucumberComponent, cucumberSystem, entity;

		beforeEach(function() {
			entity = world.createEntity();
			entity.addToWorld();
			// Process to prevent TransformComponent trigger addedComponent call on CucumberSystem
			world.process();

			cucumberSystem = new CucumberSystem();
			world.setSystem(cucumberSystem);
			cucumberComponent = new CucumberComponent();

			spyOn(cucumberSystem, 'inserted');
			spyOn(cucumberSystem, 'deleted');
			spyOn(cucumberSystem, 'addedComponent');
			spyOn(cucumberSystem, 'removedComponent');
		});

		CucumberComponent.prototype = Object.create(Component.prototype);

		it('get added call when components in the interest list are added', function() {
			entity.setComponent(cucumberComponent);
			world.process();
			expect(cucumberSystem.inserted).toHaveBeenCalled();
			expect(cucumberSystem.addedComponent).toHaveBeenCalled();
		});

		it('gets deleted call when components in the interest list are deleted', function() {
			entity.setComponent(cucumberComponent);
			world.process();
			entity.clearComponent('CucumberComponent');
			world.process();
			expect(cucumberSystem.deleted).toHaveBeenCalled();
			expect(cucumberSystem.removedComponent).toHaveBeenCalled();
		});

		it('gets no update calls when deleting a non existant component', function() {
			entity.clearComponent('CucumberComponent');
			world.process();
			expect(cucumberSystem.inserted).not.toHaveBeenCalled();
			expect(cucumberSystem.deleted).not.toHaveBeenCalled();
			expect(cucumberSystem.addedComponent).not.toHaveBeenCalled();
			expect(cucumberSystem.removedComponent).not.toHaveBeenCalled();
		});

		it('can create a typical entity holding all sorts of stuff in random order', function() {
			var camera = new Camera();
			var meshData = new Box();
			var material = Material.createMaterial(ShaderLib.simple);
			var light = new PointLight();
			var script = { run: function () {} };

			var entity = world.createEntity(camera, meshData, script, 'entitate', material, light);
			expect(entity.toString()).toBe('entitate');
			expect(entity.hasComponent('MeshDataComponent')).toBeTruthy();
			expect(entity.hasComponent('MeshRendererComponent')).toBeTruthy();
			expect(entity.hasComponent('LightComponent')).toBeTruthy();
			expect(entity.hasComponent('CameraComponent')).toBeTruthy();
			expect(entity.hasComponent('ScriptComponent')).toBeTruthy();
		});

		it('automatically adds a TransformComponent on a newly created entity', function() {
			var entity = world.createEntity();

			expect(entity.transformComponent).toBeTruthy();
		});

		it('adds an entity using the \'add\' function', function() {
			var entity = new Entity(world);

			world.add(entity);
			world.process();
			expect(world.getEntities()).toContain(entity);
		});

		it('adds a system using the \'add\' function', function() {
			var system = new TransformSystem();

			world.add(system);
			expect(world._systems).toContain(system);
		});

		it('adds a manager using the \'add\' function', function() {
			function FishManager() {
			}
			FishManager.prototype = Object.create(Manager.prototype);

			var manager = new FishManager();

			world.add(manager);
			expect(world._managers).toContain(manager);
		});

		it('registers a component using the \'add\' function', function() {
			var component = new TransformComponent();

			world.add(component);
			expect(world._components).toContain(component);
		});
	});
});