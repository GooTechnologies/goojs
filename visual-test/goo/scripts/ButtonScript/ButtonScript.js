
	goo.V.attachToGlobal();

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	world.setSystem(new HtmlSystem(gooRunner.renderer));

	V.addLights();
	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

	var entities = {
		mousedown: null,
		mouseup: null,
		click: null,
		dblclick: null,
		touchstart: null,
		touchend: null,
		mousemove: null,
		mouseover: null,
		mouseout: null
	};

	var i = 0;
	var dist = 1.2;
	var numEntities = Object.keys(entities).length;

	for (var eventType in entities) {
		// Create a cube
		var position = [i * dist - dist * (numEntities - 1) / 2, 0, 0];
		var material = V.getColoredMaterial(1, 1, 1);
		var entity = world.createEntity(new Box(), material, position).addToWorld();

		// Attach a button script to it.
		var script = Scripts.create('ButtonScript', {
			channel: 'button' + i
		});
		entity.set(script);
		entities[eventType] = entity;
		i++;

		// HTML sign below
		var htmlElement = document.createElement('p');
		htmlElement.style.position = 'absolute';
		htmlElement.style['-webkit-user-select'] = 'none';
		htmlElement.innerHTML = eventType;
		document.body.appendChild(htmlElement);
		var htmlComponent = new HtmlComponent(htmlElement);
		position[1] -= 1;
		world.createEntity(position).addToWorld().set(htmlComponent);
	}

	SystemBus.addListener('goo.scriptError', function (event) {
		console.log('Script error!', event);
	});

	function swapColor(entity) {
		var uniforms = entity.meshRendererComponent.materials[0].uniforms;
		if (uniforms.materialDiffuse[1] === 1) {
			uniforms.materialDiffuse = [1, 0, 0, 1];
		} else {
			uniforms.materialDiffuse = [1, 1, 1, 1];
		}
	}

	function handler(event) {
		swapColor(entities[event.type]);
	}

	SystemBus.addListener('button0.mousedown', handler);
	SystemBus.addListener('button1.mouseup', handler);
	SystemBus.addListener('button2.click', handler);
	SystemBus.addListener('button3.dblclick', handler);
	SystemBus.addListener('button4.touchstart', handler);
	SystemBus.addListener('button5.touchend', handler);
	SystemBus.addListener('button6.mousemove', handler);
	SystemBus.addListener('button7.mouseover', handler);
	SystemBus.addListener('button8.mouseout', handler);
});