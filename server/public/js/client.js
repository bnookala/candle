$(document).ready(function() {

	var tabActions = $('.tab-actions');

	tabActions.delegate('.client-action.select', 'click', function (event) {
		event.preventDefault();
		var target = $(event.currentTarget).attr('href');

		$.get(target, function () {
			// Need some kind of data binding. Timing isn't right here, and full page
			// refreshes don't seem to show the correct state :/
			window.location.reload();
		});

	});

	tabActions.delegate('.client-action.close', 'click', function (event) {
		event.preventDefault();
		var targetElement = $(event.currentTarget);
		var targetHref = targetElement.attr('href');

		$.get(targetHref, function () {
			// Get the encapsulating element.
			var singleTabElement = targetElement.parents('.single-tab');
			singleTabElement.fadeTo(400, 0, function () {
					singleTabElement.remove();
			});
		});
	});
});
