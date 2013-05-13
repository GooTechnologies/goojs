$(function() {
	var $list = $("nav > ul").first();
	$list.wrap('<div class="tree"></div>');
	var $tree = $list.parent();
	var path = document.location.href;
	path = path.slice(path.lastIndexOf('/')+1, path.lastIndexOf('.html')+5);
	if(path && path != 'index.html') {
		$tree.find('a').each(function() {
			if ($(this).attr('href') == path) {
				$(this).addClass('jstree-selected');
				$(this).parent().parent().siblings('a').attr('id', 'chosenNode');
			}
		});
	} else {
		var $chosen = $tree.children('ul').children('li').children('a');
		$chosen.attr('id', 'chosenNode');
		$tree.children('ul').children('li').children('a').attr('id', 'chosenNode');
	}

	$tree.jstree({
		core: {
			initially_open: ['chosenNode'],
			open_parents: true
		},
		themes: {
			icons: false,
			dots: false
		},
		search: {
			show_only_matches: true
		},
		plugins: ["html_data", "themes", "search", "ui"]
	}).bind('select_node.jstree', function(e, data) {
		var $node = data.rslt.obj;
		if($node.hasClass('jstree-leaf')) {
			document.location.href = $node.children('a').attr('href');
		}
		else {
			$tree.jstree('toggle_node', $node.attr('id'));
		}
	}).bind('clear_search.jstree', function(e, data) {
		if(!$("input#classSearch").val()) {
			$tree.jstree("close_all");
			$tree.jstree("open_node", "#chosenNode");
		}
	});

	// setup search field
	var searchField = $("input#classSearch").first();
	var searchValue = "";
	var timer;
	searchField.bind("keyup change", function(event) {
		var text = $(this).val();
		if(text != searchValue) {
			clearTimeout(timer); // Clear the timer so we don't end up with dupes.
			if(text == "") {
				$tree.jstree("clear_search");
			} else {
				timer = setTimeout($.proxy(function() {
					$tree.jstree("search", this.text);
				}, { text: text }), 200);
			}
			searchValue = text;
		}
	});
});