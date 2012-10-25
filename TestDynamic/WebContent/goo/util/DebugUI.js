define(function() {
	"use strict";

	function DebugUI(goo) {
		var that = this;

		// REVIEW: too long function
		jQuery(function($) {
			var root = $('<div/>', {
				'id' : 'debug',
				click : function() {
					$(this).toggle();
				}
			});
			root.css({
				'position' : 'absolute',
				'z-index' : '2',
				'padding' : '10px',
				'background-color' : 'gray',
				'left' : '10px',
				'top' : '10px',
				'border' : '1px solid black'
			});
			root.appendTo(document.body);
			var list = root.append('<ul></ul>');
			that.root = root;

			function Manager() {
				this.type = 'UIManager';
			}

			Manager.prototype = {
				constructor : Manager,
				added : function(entity) {
					var entities = goo.world.entityManager.getTopEntities();
					this.updateList(entities);
				},
				removed : function(entity) {
					var entities = goo.world.entityManager.getTopEntities();
					this.updateList(entities);
				},
				changed : function(entity) {
					var entities = goo.world.entityManager.getTopEntities();
					this.updateList(entities);
				},
				updateList : function(entities) {
					list.empty();
					for ( var i in entities) {
						var entity = entities[i];
						list.append('<li>' + entity.toString());
						if (entity.TransformComponent) {
							this.updateTransformList(entity.TransformComponent.children, 1);
						}
					}
				},
				updateTransformList : function(transformComponents, depth) {
					for ( var i in transformComponents) {
						var tc = transformComponents[i];
						var str = '';
						for ( var j = 0; j < depth; j++) {
							str += '--';
						}
						list.append('<li>' + str + tc.entity.toString());
						this.updateTransformList(tc.children, depth + 1);
					}
				}
			};

			goo.world.setManager(new Manager());
		});
	}

	DebugUI.prototype.init = function() {
	};

	return DebugUI;
});