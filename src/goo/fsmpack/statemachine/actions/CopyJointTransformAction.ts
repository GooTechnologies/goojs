import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class CopyJointTransformAction extends Action {
	jointIndex: number;
	everyFrame: boolean;

	constructor(id: string, options: any){
		super(id, options);
		this.everyFrame = true;
	}

	static external: External = {
		key: 'Copy Joint Transform',
		name: 'Copy Joint Transform',
		type: 'animation',
		description: 'Copies a joint\'s transform from another entity, and applies it to this entity. This entity must be a child of an entity with an animation component.',
		parameters: [{
			name: 'Joint',
			key: 'jointIndex',
			type: 'int',
			control: 'jointSelector',
			'default': null,
			description: 'Joint transform to copy.'
		}],
		transitions: []
	};

	update (fsm) {
		if (this.jointIndex === null) { return; }

		var entity = fsm.getOwnerEntity();
		var parent = entity.transformComponent.parent;
		if (!parent) { return; }

		parent = parent.entity;
		if (!parent.animationComponent || !parent.animationComponent._skeletonPose) { return; }
		var pose = parent.animationComponent._skeletonPose;
		var jointTransform = pose._globalTransforms[this.jointIndex];
		if (!jointTransform) { return; }

		entity.transformComponent.transform.matrix.copy(jointTransform.matrix);
		jointTransform.matrix.getTranslation(entity.transformComponent.transform.translation);
		jointTransform.matrix.getScale(entity.transformComponent.transform.scale);
		jointTransform.matrix.getRotation(entity.transformComponent.transform.rotation);
		updateWorldTransform(entity.transformComponent);
		entity.transformComponent.setUpdated();
	};
}

function updateWorldTransform(transformComponent) {
	transformComponent.sync();
	var entity = transformComponent.entity;
	if (entity && entity.meshDataComponent && entity.meshRendererComponent) {
		entity.meshRendererComponent.updateBounds(
			entity.meshDataComponent.modelBound,
			transformComponent.sync().worldTransform
		);
	}

	for (var i = 0; i < transformComponent.children.length; i++) {
		updateWorldTransform(transformComponent.children[i]);
	}
}

export = CopyJointTransformAction;