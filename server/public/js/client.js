$(document).ready(function() {
	var allPagesContainer = $('.all-pages');

	allPagesContainer.delegate('.client-action', 'click', function (event) {
		event.preventDefault();
		var target = $(event.currentTarget).attr('href');

		$.get(target, function () {
			// Need some kind of data binding. Timing isn't right here, and full page
			// refreshes don't seem to show the correct state :/
			window.location.reload();
		});
	});
});
