$(document).ready(function() {

	var tabActions = $('.tab-actions');
	var windowActions = $('.window-actions');

	tabActions.delegate('.tab-action.select', 'click', function (event) {
		event.preventDefault();
		var target = $(event.currentTarget).attr('href');

		$.get(target, function () {
			// Need some kind of data binding. Timing isn't right here, and full page
			// refreshes don't seem to show the correct state :/
			window.location.reload();
		});

	});

	tabActions.delegate('.tab-action.close', 'click', function (event) {
		event.preventDefault();
		var targetElement = $(event.currentTarget);
		var targetHref = targetElement.attr('href');

		$.get(targetHref, function () {
			// Get the encapsulating element, and remove it.
			var singleTabElement = targetElement.parents('.single-tab');
			singleTabElement.fadeTo(400, 0, function () {
				// If the list doesn't contain any immediate children anymore, just remove it.
				var listContainer = targetElement.parents('.single-window');
				if (listContainer.find('> ul > li').length === 1) {
					listContainer.fadeTo(400, 0, function () {
						singleTabElement.remove();
						listContainer.remove();
					});
				}
			});

		});
	});

	windowActions.delegate('.window-action.toggle-rotate', 'click', function (event) {
		event.preventDefault();
		var targetElement = $(event.currentTarget);
		var targetHref = targetElement.attr('href');

		$.get(targetHref, function () {
			// Get the encapsulating element.
		});

	});

});
