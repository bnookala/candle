$(document).ready(function() {
    var clientActions = $('.client-actions');

    clientActions.delegate('.client-action.clear', 'click', function (event) {
        event.preventDefault();
        var targetElement = $(event.currentTarget);
        var target = targetElement.attr('href');

        if (window.confirm("Are you sure you would like to remove this client's data?")) {
            $.get(target, function () {
                var singleClient = targetElement.parents('.single-client');
                singleClient.fadeTo(400, 0, function () {
                    singleClient.remove();
                });
            });
        } else {
            return;
        }
    });

});
