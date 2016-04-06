module.exports = {
	"Context": {
		"!type": "fn()",
		"!url": "http://goocreate.com/learn/the-ctx-object/",
		"!doc": "The Context object lets you access useful variables in the Goo World",
		"prototype": {
			"entity": {
				"!type": "+goo.Entity",
				"!doc": "Access to the entity on which the script is defined."
			},
			"world": {
				"!type": "+goo.World",
				"!doc": "The world object opens up paths to everything, pretty much. The world object is used to select any entity (using by), getting the very useful time per frame (tpf) variable or grabbing hold of the gooRunner (and from there the renderer, and so on)."
			},
			"entityData": {
				"!type": "+object",
				"!doc": "Data shared between all scripts belonging to a certain entity."
			},
			"worldData": {
				"!type": "+object",
				"!doc": "Data shared between all scripts."
			},
			"domElement": {
				"!type": "+Element",
				"!doc": "Access to the canvas element Goo renders in."
			},
			"viewportWidth": {
				"!type": "number",
				"!doc": "Width of the viewport"
			},
			"viewportHeight": {
				"!type": "number",
				"!doc": "Height of the viewport"
			},
			"activeCameraEntity": {
				"!type": "+goo.Entity",
				"!doc": "A quick way to get a hold of the camera entity which is currently used."
			},
			"playTime": {
				"!type": "number",
				"!doc": "Current playing time in seconds, starting from 0 when the scene starts."
			}
		}
	},
	"Arguments": {
		"!type": "fn()",
		"!url": "http://goocreate.com/learn/parameters/",
		"!doc": "To define custom parameters in a Create script, the parameter array and the args object are used."
	}
};