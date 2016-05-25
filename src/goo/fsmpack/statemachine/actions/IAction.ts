export interface IAction {
	(): void;
	external: {
		parameters: Array<{
            name: string;
            key: string;
            type: string;
            control?: string;
            description: string;
            default: string|number|Array<number>;
            options?: Array<string>;
            min?: number;
            max?: number;
        }>;
		key: string;
		name: string;
		description: string;
		type: string;
		transitions: Array<{
            key: string;
            description: string;
        }>;
	};
}

export default IAction;