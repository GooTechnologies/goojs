define([
	'goo/entities/systems/System',
	'goo/entities/EventHandler',
	'goo/renderer/SimplePartitioner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Util'
],
/** @lends */
function (
	System,
	EventHandler,
	SimplePartitioner,
	Material,
	ShaderLib,
	Util
) {
	"use strict";

	/**
	 * @class Renders entities/renderables using a configurable partitioner for culling
	 * @property {Boolean} doRender Only render if set to true
	 */
	function GizmoRenderSystem() {
		System.call(this, 'GizmoRenderSystem');

		this.renderables = [];
		this.camera = null;
		
		this.gizmos = [
			new TranslationGizmo(),
			new RotationGizmo(),
			new ScaleGizmo()
		];
		
		this.setupCallbacks();
		this.boundEntity = null;
		this.activeGizmo = null;
		this.viewportWidth = 0;
		this.viewportHeight = 0;
		
		this.mouseMove = function(evt) {
			if(!this.activeGizmo) {
				return;
			}
			this.activeGizmo.update([
				evt.offsetX / this.viewportWidth
				evt.offsetY / this.viewportHeight
			]);
		}.bind(this);
		

		var that = this;
		EventHandler.addListener({
			setCurrentCamera : function (camera) {
				that.camera = camera;
			}
		});
	};
	
	GizmoRenderSystem.prototype.activate = function(id, x, y) {
		var handle = Gizmo.getHandle(id);
		if (handle && this.activeGizmo) {
			this.activeGizmo.activate({
				data: handle,
				x: x / this.viewportWidth,
				y: y / this.viewportHeight
			});
			this.domElement.addEventListener('mousemove', this.mouseMove);
		}
	};
	
	GizmoRenderSystem.prototype.deactivate = function() {
		this.domElement.removeEventListener('mousemove', this.mouseMove);
	};
	
	GizmoRenderSystem.prototype.show = function(entity, global) {
		this.entity = entity;
		if (this.activeGizmo) {
			if (this.entity) {
				this.activeGizmo.copyTransform(this.entity.transformComponent.worldTransform, !global);
				this.showGizmo(this.activeGizmo);
			} else {
				this.hideGizmo(this.activeGizmo);
			}
		}
	};
	
	GizmoRenderSystem.prototype.showGizmo = function(gizmo) {
		this.activeGizmo.copyTransform(this.entity.trasnformComponent.worldTRansform)
		if (!gizmo.visible) {
			this.renderables = gizmo.renderables;
			gizmo.visible = true;
		}
	}
	
	GizmoRenderSystem.prototype.hideGizmo = function(gizmo) {
		if (gizmo.visible) {
			this.renderables = [];
			gizmo.visible = false;
		}
	};
	
	GizmoRenderSystem.prototype.setActiveGizmo = function(id) {
		if (this.activeGizmo) {
			this.hideGizmo(this.activeGizmo);
		}
		this.activeGizmo = this.gizmos[id] || null;
		if (this.activeGizmo && this.entity) {
			this.showGizmo(this.activeGizmo);
		}
	}
	
	GizmoRenderSystem.prototype.setupCallbacks = function() {
		this.gizmos[0].onChange = function(change) {
			if (this.entity) {
				v0.seta(change);
				if (this.entity.transformComponent.parent) {
					invMat4.copy(this.entity.transformComponent.parent.worldTransform.matrix);
					invMat4.invert();
					invMat4.applyPostVector(v0);
				}
				this.entity.transformComponent.transform.translation.setv(v0);
				this.entity.transformComponent.setUpdated();
			}
		}.bind(this);

		this.gizmos[1].onChange = function(change) {
			if (this.entity) {
				this.entity.transformComponent.transform.setRotationXYZ(change[0], change[1], change[2]);
				if (this.entity.transformComponent.parent) {
					invMat3.copy(this.entity.transformComponent.parent.worldTransform.rotation);
					invMat3.invert();
				}
				Matrix3x3.combine(
					invMat3,
					this.entity.transformComponent.transform.rotation,
					this.entity.transformComponent.transform.rotation
				);
				this.entity.transformComponent.setUpdated();
			}
		}.bind(this);

		this.gizmos[2].onChange = function(change) {
			if (this.entity) {
				v0.seta(change)
				if (this.entity.transformComponent.parent) {
					v0.div(this.entity.transformComponent.parent.worldTransform.scale);
				}
				this.entity.transformComponent.transform.scale.setv(v0);
				this.entity.transformComponent.setUpdated();
			}
		}.bind(this);
	}

	GizmoRenderSystem.prototype = Object.create(System.prototype);

	GizmoRenderSystem.prototype.inserted = function (/*entity*/) {};

	GizmoRenderSystem.prototype.deleted = function (/*entity*/) {};

	GizmoRenderSystem.prototype.process = function (/*entities, tpf*/) {};

	GizmoRenderSystem.prototype.render = function (renderer, picking) {
		renderer.checkResize(this.camera);
		if (this.camera) {
			renderer.render(this.renderables, this.camera, this.lights, null, true, this.overrideMaterials);
			if(picking.doPick) {
				renderer.renderToPick(this.renderList, this.camera, true, picking.skipUpdateBuffer);
			}
		}
	};
	return RenderSystem;
});