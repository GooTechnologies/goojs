goo.V.attachToGlobal();

V.describe('All spheres have an html component attached which should have it\'s transform synced');

var gooRunner = V.initGoo({
	useDevicePixelRatio: true
});
var world = gooRunner.world;

V.addLights();
V.addOrbitCamera(new Vector3(30, Math.PI / 2, Math.PI / 4));

// add text system to world
world.setSystem(new HtmlSystem(gooRunner.renderer));

// add spheres
var spheres = V.addColoredShapes(15, new Sphere(8, 8));

// and html elements for every sphere
spheres.each(function (entity) {
	var htmlElement = document.createElement('p');
	htmlElement.style.position = 'absolute';
	htmlElement.style['-webkit-user-select'] = 'none';
	htmlElement.innerHTML = 'A round box!';
	document.body.appendChild(htmlElement);

	var htmlComponent = new HtmlComponent(htmlElement, {
		useTransformComponent: MathUtils.fastRandom() > 0.1,
		pixelPerfect: MathUtils.fastRandom() > 0.5
	});

	entity.set(htmlComponent);

	if (MathUtils.fastRandom() > 0.8) {
		entity.hide();
	}
});

V.process();