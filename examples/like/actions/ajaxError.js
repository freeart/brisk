App.actions.ajaxError = function (e, el, prevArgs) {
	var dfd = $.Deferred();

	setTimeout(function () {
		dfd.reject();
	}, 1000);

	return dfd.promise();
};