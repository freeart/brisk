App.actions.rate = {
	success:function (e, el, prevArgs, steps) {
		var dfd = $.Deferred();

		setTimeout(function () {
			console.log('rate.success', prevArgs, steps);
			dfd.resolve({
				".like":{
					"html":'<a href="#" class="like" data-ready="1" data-id="42" data-rate="2" role="block">&hearts;&nbsp;<em>2</em></a>',
					"mode":"replace"
				}
			});
		}, 1000);

		return dfd.promise();
	},
	error:function (e, el, prevArgs, steps) {
		var dfd = $.Deferred();

		setTimeout(function () {
			console.log('rate.error', prevArgs, steps);
			dfd.reject(prevArgs);
		}, 1000);

		return dfd.promise();
	},
	before:function (e, el, prevArgs, steps) {
		if (prevArgs.ready) return false;

		$(el).find('em').text(prevArgs.rate + 1);
		console.log('rate.before', prevArgs, steps);
	},
	rollback:function (e, el, prevArgs, steps) {
		$(el).find('em').text(prevArgs.rate);
		console.log('rate.rollback', prevArgs, steps);
	}
};