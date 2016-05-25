var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');
import {External} from './IAction';

class Action {
    id: string;
    constructor(id: string, settings: any){
        this.id = id;
        this.configure(settings || {});
    }

    /* this should be called by the constructor and by the handlers when new options are loaded */
    configure (settings) {
        var constructor = this.constructor as { (): void; external: External };
        FsmUtils.setParameters.call(this, settings, constructor.external.parameters);
        FsmUtils.setTransitions.call(this, settings, constructor.external.transitions);
    }

    /* this gets executed on enter - called once, when the host state becomes active */
    enter (fsm: any) {
    }

    /* this gets executed on update - called on every frame */
    update (fsm: any) {
    }

    exit (fsm: any) {
    }

    /* this is called when the machine just started */
    ready (fsm: any) {
    }

    /* this is called when the machine stops and makes sure that any changes not undone by exit methods get undone */
    cleanup (fsm: any) {
    }
}

export = Action;