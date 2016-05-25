export interface IAction {
	(): any;
	external: {
		parameters: Array<any>;
		key: string;
		name: string;
		description: string;
		type: string;
		transitions: Array<any>;
	};
}

export default IAction;