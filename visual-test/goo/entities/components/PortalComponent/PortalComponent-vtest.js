require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/Sphere',
	'goo/shapes/Quad',
	'goo/entities/components/ScriptComponent',
	'goo/math/Vector3',
	'goo/entities/systems/PortalSystem',
	'goo/entities/components/PortalComponent',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Camera,
	Sphere,
	Quad,
	ScriptComponent,
	Vector3,
	PortalSystem,
	PortalComponent,
	V
	) {
	'use strict';

    V.describe([
        '4 portals with different properties',
        'Controls:',
        '',
        '1: request redraw of the upper-left portal',
        '2: add-remove the portal component on the bottom-left portal'
    ].join('\n'));

    V.button('1', key1);
    V.button('2', key2);

	function addPortalSystem() {
		var renderingSystem = goo.world.getSystem('RenderSystem');
		var renderer = goo.renderer;
		goo.world.setSystem(new PortalSystem(renderer, renderingSystem));
	}

	function addPortal(camera, x, y, z, dim, options, overrideMaterial) {
		var quadMeshData = new Quad(dim, dim);
		var quadMaterial = new Material(ShaderLib.textured);
		var quadEntity = world.createEntity(quadMeshData, quadMaterial);
		quadEntity.transformComponent.transform.translation.set(x, y, z);
		var portalComponent = new PortalComponent(camera, 500, options, overrideMaterial);
		quadEntity.setComponent(portalComponent);
		quadEntity.addToWorld();

		return quadEntity;
	}

	function addSpinningCamera(rotationOffset) {
		var camera = new Camera();
		var cameraEntity = world.createEntity('SpinningCameraEntity', camera);

		var radius = 10;
		cameraEntity.setComponent(new ScriptComponent({
			run: function (entity) {
				entity.transformComponent.transform.translation.set(
					Math.cos(world.time + rotationOffset) * radius,
					0,
					Math.sin(world.time + rotationOffset) * radius
				);
				entity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
				entity.transformComponent.setUpdated();
			}
		}));

		//cameraEntity.setComponent(new CameraDebugComponent());

		cameraEntity.addToWorld();

		return camera;
	}

	function addUserCamera() {
		return V.addOrbitCamera(new Vector3(25, Math.PI / 4, 0)).cameraComponent.camera;
	}

	var goo = V.initGoo();
	var world = goo.world;

	// basic setup
	V.addColoredSpheres();
	V.addLights();

	// create a user camera
	var userCamera = addUserCamera();

	// create one more camera
	var spinningCamera = addSpinningCamera(0);

	// add the portal system to the world
	addPortalSystem();

	// override material for one of the portals
	var overrideMaterial = Material.createEmptyMaterial(ShaderLib.simpleLit, 'overrideMaterial');
	overrideMaterial.blendState = {
		blending: 'NoBlending',
		blendEquation: 'AddEquation',
		blendSrc: 'SrcAlphaFactor',
		blendDst: 'OneMinusSrcAlphaFactor'
	};

	// add portals
	var userCameraPortalEntity = addPortal(userCamera, -3,  3, 2, 5, { preciseRecursion: true, alwaysRender: true });
	var overridenMaterialPortalEntity = addPortal(userCamera,  3,  3, 2, 5,
		{ preciseRecursion: true, autoUpdate: false, alwaysRender: true }, overrideMaterial);
	var spinningCameraEntity = addPortal(spinningCamera, -3, -3, 2, 5, { preciseRecursion: true, alwaysRender: true });
	var addRemovePortalEntity = addPortal(userCamera,  3, -3, 2, 5, { preciseRecursion: true, alwaysRender: true });
	var storedPortalComponent = addRemovePortalEntity.portalComponent;

    function key1() {
        console.log('redrawing');
        overridenMaterialPortalEntity.portalComponent.requestUpdate();
    }

    function key2() {
        if (addRemovePortalEntity.portalComponent) {
            addRemovePortalEntity.clearComponent('PortalComponent');
            console.log('cleared');
        } else {
            addRemovePortalEntity.setComponent(storedPortalComponent);
            console.log('added');
        }
    }

	// setup some interaction
	document.addEventListener('keypress', function (e) {
		switch (e.which) {
			case 49: key1(); break;
			case 50: key2(); break;
			default:
				console.log(
                    '1 - request redraw of the non-auto updated portal\n' +
                    '2 - add/remove a portal component on one of the portals'
				);
		}
	});

	V.process(6);
});
