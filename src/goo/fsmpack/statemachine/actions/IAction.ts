var FsmUtils = require('../FsmUtils');

export interface GetTransitionLabelFunc {
    (transitionKey: string, actionConfig: any): string;
}

export interface Transition {
    key: string;
    description: string;
};

export interface Parameter {
    name: string;
    key: string;
    type: string;
    control?: string;
    description: string;
    default?: string|number|Array<number>|boolean;
    options?: Array<string>;
    min?: number;
    max?: number;
};

export interface External {
    parameters: Array<Parameter>;
    key: string;
    name: string;
    description: string;
    type: string;
	transitions: Array<Transition>;
    canTransition?: boolean;
};