import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
import Vector3 = require('../../../math/Vector3');

class MoveAction extends Action {
	translation: Array<number>;
	oriented: boolean;
	relative: boolean;
	everyFrame: boolean;
	forward: any;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Move',
		name: 'Move',
		type: 'animation',
		description: 'Moves the entity.',
		parameters: [{
			name: 'Translation',
			key: 'translation',
			type: 'position',
			description: 'Move.',
			'default': [0, 0, 0]
		}, {
			name: 'Oriented',
			key: 'oriented',
			type: 'boolean',
			description: 'If true translate with rotation.',
			'default': true
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add to current translation.',
			'default': true
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.sync().transform;
		this.forward = Vector3.fromArray(this.translation);
		var orientation = transform.rotation;
		this.forward.applyPost(orientation);

		if (!this.everyFrame) {
			this.applyMove(fsm);
		}
	};

	update (fsm) {
		if (this.everyFrame) {
			this.applyMove(fsm);
		}
	};

	applyMove (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.sync().transform;
		var translation = transform.translation;

		if (this.oriented) {
			if (this.relative) {
				var forward = Vector3.fromArray(this.translation);
				var orientation = transform.rotation;
				forward.applyPost(orientation);

				if (this.everyFrame) {
					forward.scale(fsm.getTpf());
					translation.add(forward);
				} else {
					translation.add(forward);
				}
			} else {
				translation.set(this.forward);
			}
		} else {
			if (this.relative) {
				if (this.everyFrame) {
					var tpf = fsm.getTpf();
					translation.addDirect(this.translation[0] * tpf, this.translation[1] * tpf, this.translation[2] * tpf);
				} else {
					translation.addDirect(this.translation[0], this.translation[1], this.translation[2]);
				}
			} else {
				translation.setDirect(this.translation[0], this.translation[1], this.translation[2]);
			}
		}

		entity.transformComponent.setUpdated();
	};
}

export = MoveAction;