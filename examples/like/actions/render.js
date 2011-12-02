App.actions.render = function (e, el, prevArgs) {
	var dfd = new $.Deferred,
			error = false;

	$.each(prevArgs, function (selector, config) {
		var $target = $(selector);

		config.html = config.html || '&nbsp;';

		switch (config.mode) {
			case 'replace':
				var $newContent = $(config.html).hide();
				$target.after($newContent)
				$target.hide();
				$newContent.show();
				$target.remove();
				break;

			case 'append':
				$target.append(config.html);
				break;

			case 'prepend':
				$target.prepend(config.html);
				break;

			case 'delete':
				$target.remove();
				break;

			default:
				error = true;
		}
	});

	if (error) {
		dfd.reject(prevArgs);
	}
	else {
		dfd.resolve();
	}

	return dfd.promise();
};