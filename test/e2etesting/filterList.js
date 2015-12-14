// jshint node:true

var filterList = [
	'example',
	'carousel',
	'Destroy',
	'GooToImage',
	'RestoreContext',
	'GroundBound',
	'Gamepad',
	'Script',
	'script',
	'stress',
	'goofy',
	'TimelineComponent',
	'HTMLComponent', // displays nothing on the canvas, it's html!
	'Dom3dComponent', // displays nothing on the canvas, it's html!
	'Cannon-terrain', // needs fixing
	'HtmlComponentHandler', // displays nothing on the canvas, it's html!
	'CrunchLoader',
	'Portal', // this used to work when the wait time was high
	'GameUtils',  // pointer lock and co
	'WebCam', // can't possibly test if the webcam is working right

	// tests that are rendered slightly differently and should be fixed some way
	'FromAngleNormalAxis',
	'RayIntersectsPlane',
	'WorldPickCoords',
	'MeshBuilder',
	'Skybox',
	'Cubemap',

	'physicspack', // tests that just need screenshots; silenting them until that is resolved
	'Cannon-cylinder',
	'Clone-camera',
	'Spline',
	'TextComponent',
	'TextMeshGenerator',
	'linerenderpack',
	'Pipe',
	'PolyLine',
	'ParticleInfluence',
	'HeightMap',
	'SkeletonAnimation',
	'Sound-shared',
	'projected-water',

	'GridRenderSystem' // until we can render updated screenshot
];

exports.filterList = filterList;
