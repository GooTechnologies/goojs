define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6989);
    function PickAndExitAction() {
        Action.apply(this, arguments);
        __touch(6999);
        this.eventListener = function (event) {
            var htmlCmp = this.ownerEntity.getComponent('HtmlComponent');
            __touch(7001);
            var clickedHtmlCmp = htmlCmp && htmlCmp.domElement.contains(event.target);
            __touch(7002);
            if (clickedHtmlCmp) {
                this.handleExit();
                __touch(7009);
                return;
                __touch(7010);
            }
            if (event.target !== this.canvasElement) {
                return;
                __touch(7011);
            }
            var x, y;
            __touch(7003);
            if (event.touches) {
                x = event.touches[0].clientX;
                __touch(7012);
                y = event.touches[0].clientY;
                __touch(7013);
            } else {
                x = event.offsetX;
                __touch(7014);
                y = event.offsetY;
                __touch(7015);
            }
            var pickResult = this.goo.pickSync(x, y);
            __touch(7004);
            if (pickResult.id === -1) {
                return;
                __touch(7016);
            }
            var entity = this.goo.world.entityManager.getEntityByIndex(pickResult.id);
            __touch(7005);
            var descendants = [];
            __touch(7006);
            this.ownerEntity.traverse(descendants.push.bind(descendants));
            __touch(7007);
            if (descendants.indexOf(entity) === -1) {
                return;
                __touch(7017);
            }
            this.handleExit();
            __touch(7008);
        }.bind(this);
        __touch(7000);
    }
    __touch(6990);
    PickAndExitAction.prototype = Object.create(Action.prototype);
    __touch(6991);
    PickAndExitAction.prototype.constructor = PickAndExitAction;
    __touch(6992);
    PickAndExitAction.external = {
        name: 'Pick and Exit',
        type: 'controls',
        description: 'Listens for a picking event on the entity and opens a new browser window',
        canTransition: true,
        parameters: [
            {
                name: 'URL',
                key: 'url',
                type: 'string',
                description: 'URL to open',
                'default': 'http://www.goocreate.com/'
            },
            {
                name: 'Exit name',
                key: 'exitName',
                type: 'string',
                description: 'Name of the exit, used to track this exit in Ads.',
                'default': 'clickEntityExit'
            }
        ],
        transitions: []
    };
    __touch(6993);
    PickAndExitAction.prototype._setup = function (fsm) {
        this.ownerEntity = fsm.getOwnerEntity();
        __touch(7018);
        this.goo = this.ownerEntity._world.gooRunner;
        __touch(7019);
        this.canvasElement = this.goo.renderer.domElement;
        __touch(7020);
        this.domElement = this.canvasElement.parentNode;
        __touch(7021);
        this.domElement.addEventListener('click', this.eventListener, false);
        __touch(7022);
        this.domElement.addEventListener('touchstart', this.eventListener, false);
        __touch(7023);
    };
    __touch(6994);
    PickAndExitAction.prototype._run = function () {
    };
    __touch(6995);
    PickAndExitAction.prototype.handleExit = function () {
        var handler = window.gooHandleExit || function (url) {
            window.open(url, '_blank');
            __touch(7026);
        };
        __touch(7024);
        handler(this.url, this.exitName);
        __touch(7025);
    };
    __touch(6996);
    PickAndExitAction.prototype.exit = function () {
        if (this.domElement) {
            this.domElement.removeEventListener('click', this.eventListener);
            __touch(7027);
            this.domElement.removeEventListener('touchstart', this.eventListener);
            __touch(7028);
        }
    };
    __touch(6997);
    return PickAndExitAction;
    __touch(6998);
});
__touch(6988);