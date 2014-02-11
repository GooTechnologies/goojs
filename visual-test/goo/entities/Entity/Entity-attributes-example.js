require([
	'goo/entities/GooRunner'
], function(
	GooRunner
) {
	'use strict';

	var goo = new GooRunner();

	goo.renderer.domElement.id = 'goo';
	document.body.appendChild(goo.renderer.domElement);

	// ---
	var world = goo.world;

	// a very simple game
	var hero = world.createEntity()
		.setTag('hero')
		.setAttribute('hit-points', 30)
		.setAttribute('attack-power', 3)
		.setTag('alive')
		.addToWorld();

	var monster = world.createEntity()
		.setTag('monster')
		.setAttribute('hit-points', 20)
		.setAttribute('attack-power', 2)
		.setTag('alive')
		.addToWorld();

	function monsterAttacks() {
		// if both are still alive
		if (monster.hasTag('alive') && hero.hasTag('alive')) {
			// monster makes his move!
			console.log('Monster attacks!');
			hero.setAttribute('hit-points', hero.getAttribute('hit-points') - monster.getAttribute('attack-power'));

			// hero may die
			if (hero.getAttribute('hit-points') <= 0) {
				hero.clearTag('alive');
				console.log('The hero has fallen');
			} else {
				// monster gets ready for his next move
				console.log('The hero how has', hero.getAttribute('hit-points'), 'hit points left');
				setTimeout(monsterAttacks, 1000);
			}
		}
	}

	window.addEventListener('keydown', function () {
		if (monster.hasTag('alive') && hero.hasTag('alive')) {
			console.log('The hero bravely slashes at the monster!');
			monster.setAttribute('hit-points', monster.getAttribute('hit-points') - hero.getAttribute('attack-power'));

			// monster may die
			if (monster.getAttribute('hit-points') <= 0) {
				monster.clearTag('alive');
				console.log('The hero triumphs!');
			} else {
				console.log('The monster how has', monster.getAttribute('hit-points'), 'hit points left');
			}
		}
	});

	console.log('Hit any key to hit the monster');
	monsterAttacks();
});