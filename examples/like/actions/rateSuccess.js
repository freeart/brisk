App.actions.rateSuccess = function (e, el, prevArgs) {
	var dfd = $.Deferred();

	setTimeout(function () {
		dfd.resolve({
			".like" : {
				"html":"<a href='#' class='like'>&hearts;&nbsp;<em>2</em></a>",
				"mode":"replace"
			}
		});
	}, 1000);

	return dfd.promise();
};