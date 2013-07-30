define([
	'goo/entities/Entity',
	'goo/entities/managers/EntityManager',
	'goo/entities/components/TransformComponent',
	'goo/math/Ray',
	'goo/entities/systems/PickingSystem',
	'goo/picking/PrimitivePickLogic',
	'goo/renderer/Renderer'
],
	/** @lends */
	function (
	Entity,
	EntityManager,
	TransformComponent,
	Ray,
	PickingSystem,
	PrimitivePickLogic,
	Renderer
	) {
	"use strict";

	function Debugger(goo) {
		this.goo = goo;
		this.active = true;
	}

	Debugger.prototype.inject = function() {
		createPanel();

		var picking = new PickingSystem({
			pickLogic: new PrimitivePickLogic()
		});

		this.goo.world.setSystem(picking);

		var picked = null;

		picking.onPick = function(pickedList) {
			if (pickedList && pickedList.length) {
				picked = pickedList[0].entity;
				displayInfo(picked);
			}
		};

		var that = this;
		document.addEventListener('mousedown', function(event) {
			//event.preventDefault();
			event.stopPropagation();

			var mouseDownX = event.pageX;
			var mouseDownY = event.pageY;

			var ray = new Ray();
			Renderer.mainCamera.getPickRay(mouseDownX, mouseDownY, that.goo.renderer.viewportWidth, that.goo.renderer.viewportHeight, ray);

			// Ask all appropriate world entities if they've been picked
			picking.pickRay = ray;
			picking._process();
		}, false);

		// setting up onchange for debug parameters
		document.getElementById('debugparams').addEventListener('keyup', function() {
			displayInfo(picked);
		});
	};

	function createPanel() {
		var div = document.createElement('div');
		div.id = 'debugdiv';
		div.innerHTML =
			'<span style="font-size: x-small;font-family: sans-serif">Filter</span><br />' +
			'<textarea cols="30" id="debugparams">name, Compo, tran, data</textarea><br />' +
			'<span style="font-size: x-small;font-family: sans-serif">Result:</span><br />' +
			'<textarea readonly rows="10" cols="30" id="debugtex">Click on an entity</textarea>';
		div.style.position = 'absolute';
		div.style.zIndex = '2001';
		div.style.backgroundColor = '#DDDDDD';
		div.style.left = '10px';
		div.style.top = '100px';
		div.style.webkitTouchCallout = 'none';
		div.style.webkitUserSelect = 'none';
		div.style.khtmlUserSelect = 'none';
		div.style.mozUserSelect = 'none';
		div.style.msUserSelect = 'none';
		div.style.userSelect = 'none';

		div.style.padding = '3px';
		div.style.borderRadius = '6px';

		document.body.appendChild(div);
	}

	function getFilterList(str) {
		return str.split(',').map(function(entry) {
				return entry.replace(/(^[\s]+|[\s]+$)/g, '');
			}).filter(function(entry) {
				return entry.length > 0;
			}).map(function(entry) {
				return new RegExp(entry);
			});
	}

	function filterProperties(obj, interests, ident) {
		if(interests.length === 0) { return 'No interests specified;\n\nSome popular interests: is, tran, Compo\n\nEvery entry separated by a comma is a regex'; }

		if(obj === null) {
			return 'null';
		} else if(typeof obj === 'undefined') {
			return obj + '\n';
		} else if(typeof obj === 'number') {
			return '"' + obj + '"\n';
		} else if(typeof obj === 'boolean') {
			return obj + '\n';
		} else if(typeof obj === 'string') {
			return '"' + obj + '"\n';
		} else if(obj instanceof Array && (typeof obj[0] === 'string' || typeof obj[0] === 'number')) {
			return '[' + obj.join(' ') + ']\n';
		}
		else if(Object.prototype.toString.call(obj).indexOf('Array]') !== -1) {
			var ret = '[' + obj[0];
			for (var i = 1; i < obj.length; i++) {
				ret += ' ' + obj[i];
			}
			ret += ']\n';
			return ret;
		} else {
			var ret = '';
			for (var prop in obj) {
				if(typeof obj[prop] !== 'function') {
					for (var i in interests) {
						if(interests[i].test(prop)) {
							ret += prop;
							var filter_Str = filterProperties(obj[prop], interests, ident + ' ');

							if(filter_Str.length === 0) {
								ret += filter_Str;
								ret += '\n';
							} else {
								ret += '.';
								ret += filter_Str;
							}
							break;
						}
					}
				}
			}
			return ret;
		}
	}

	function displayInfo(entity) {
		var filterList = getFilterList(document.getElementById('debugparams').value);
		console.log('==> ', entity);

		var elem = document.getElementById('debugtex');

		var entityStr;
		try {
			entityStr = filterProperties(entity, filterList, '');
		} catch(err) {
			entityStr = 'Too many results; narrow your search';
		}
		elem.value = entityStr;
	}

	return Debugger;
});
