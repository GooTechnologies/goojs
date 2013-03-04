define(function () {
	"use strict";

	function DebugUI(goo) {
		var that = this;

		goo.callbacks.push(function () {
			var allEntities = goo.world.entityManager.getEntities();
			for (var i in allEntities) {
				var entity = allEntities[i];
				goo.world.changedEntity(entity);
			}
		});

		// REVIEW: too long function
		jQuery(function ($) {
			var root = $('<div/>', {
				'id' : 'debug',
				click : function () {
					$(this).toggle();
				}
			});
			root.css({
				'position' : 'absolute',
				'z-index' : '2',
				'padding' : '5px',
				'background-color' : 'gray',
				'left' : '10px',
				'top' : '10px',
				'border' : '1px solid black'
			});
			root.appendTo(document.body);
			var list = $('<ul>').appendTo(root);
			that.root = root;

			function Manager() {
				this.type = 'UIManager';
			}

			Manager.prototype = {
				constructor : Manager,
				added : function () {
					var entities = goo.world.entityManager.getTopEntities();
					this.updateList(entities);
				},
				removed : function () {
					var entities = goo.world.entityManager.getTopEntities();
					this.updateList(entities);
				},
				changed : function () {
					var entities = goo.world.entityManager.getTopEntities();
					this.updateList(entities);
				},
				updateList : function (entities) {
					list.empty();
					// var childList = $('<ul>').appendTo(list);
					for (var i in entities) {
						var entity = entities[i];
						$('<li>').appendTo(list).append(entity.toString()).append(
							' - ' + (entity.meshRendererComponent !== undefined ? entity.meshRendererComponent.worldBound : 'none') + ', '
								+ entity.isVisible).append(
							' - ' + (entity.transformComponent !== undefined ? entity.transformComponent.transform : ''));
						if (entity.transformComponent) {
							this.updateTransformList(entity.transformComponent.children, 1, list);
						}
					}
				},
				updateTransformList : function (transformComponents, depth, list) {
					if (transformComponents.length <= 0) {
						return;
					}

					var childList = $('<ul>').appendTo(list);
					for (var i in transformComponents) {
						var tc = transformComponents[i];
						var mrc = tc.entity.meshRendererComponent;
						var bounds = mrc !== undefined ? mrc.worldBound : 'none';
						var material = mrc !== undefined ? mrc.materials[0] : undefined;
						var shader = material !== undefined ? material.shader : 'nope';
						$('<li>').appendTo(childList).append(tc.entity.toString()).append(' - ' + bounds + ', ' + tc.entity.isVisible).append(
							' - ' + shader).append(' - ' + tc.transform);
						this.updateTransformList(tc.children, depth + 1, childList);
					}
				}
			};

			goo.world.setManager(new Manager());
		});
	}

	DebugUI.prototype.init = function () {
	};

	return DebugUI;
});