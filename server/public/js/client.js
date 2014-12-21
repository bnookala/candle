$(document).ready(function() {

	var tabActions = $('.tab-actions');
	var windowActions = $('.window-actions');

	tabActions.delegate('.js-select', 'click', function (event) {
		event.preventDefault();
		var target = $(event.currentTarget).attr('href');

		$.get(target, function () {
			// Need some kind of data binding. Timing isn't right here, and full page
			// refreshes don't seem to show the correct state :/
			window.location.reload();
		});
	});

	tabActions.delegate('.js-close', 'click', function (event) {
		event.preventDefault();
		var targetElement = $(event.currentTarget);
		var targetHref = targetElement.attr('href');

		$.get(targetHref, function () {
			// Get the encapsulating element, and remove it.
			var singleTabElement = targetElement.parents('.single-tab');
			singleTabElement.fadeTo(400, 0, function () {
				singleTabElement.remove();
			});

		});
	});

	windowActions.delegate('.window-action.toggle-rotate', 'click', function (event) {
		event.preventDefault();
		var targetElement = $(event.currentTarget);
		var targetHref = targetElement.attr('href');

		$.get(targetHref);
	});

	windowActions.delegate('form.new-url', 'submit', function (event) {
		event.preventDefault();
		var targetElement = $(event.currentTarget);

		var url = targetElement.find('.new-url-input')[0].value;
		var targetHref = targetElement.find('.new-url-submit').attr('action');

		if (!url) {
			return;
		}

		$.get(targetHref, {'url': url}, function () {
			window.location.reload();
		});
	});

});
