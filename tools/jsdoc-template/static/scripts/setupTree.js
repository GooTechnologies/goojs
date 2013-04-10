$(function() {
	var $list = $("nav > ul").first();
	$list.wrap('<div class="tree"></div>');
	$tree = $list.parent();
	$tree.find('a').each(function() {
		var path = document.location.href;
		path = path.slice(path.lastIndexOf('/')+1);
		if ($(this).attr('href') == path) {
			$(this).addClass('jstree-selected');
			$(this).parent().parent().siblings('a').attr('id', 'chosenNode');
		}
	});

	$tree.jstree({
		core: {
			initially_open: ['chosenNode'],
			open_parents: true
		}
	});
	$tree.bind('loaded.jstree', function() {
		$tree.children('ul').addClass('jstree-no-icons jstree-no-dots');
		
	})
		.bind('select_node.jstree', function(e, data) {
			var $node = data.rslt.obj;
			if($node.hasClass('jstree-leaf')) {
				document.location.href = $node.children('a').attr('href');
			}
			else {
				$tree.jstree('toggle_node', $node.attr('id'));
			}
		});
});