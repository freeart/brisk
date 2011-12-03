App = {
	actions: {}
}

App.actions.common = {
	addLoader:function (e, el, prevArgs) {
		$(el).addClass('working');
		console.log('addLoader', prevArgs);
	},
	dataGrabber:function (e, el, prevArgs) {
		var dfd = new $.Deferred,
				$dataSource = $(el).attr('role') == "block" ? $(el) : $(el).closest('[role="block"]');

		if ($dataSource.length) {
			dfd.resolve($dataSource.data());
		}
		else {
			dfd.resolve({});
		}

		console.log('dataGrabber', prevArgs);

		return dfd.promise();
	},
	formGrabber:function (e, el, prevArgs) {
		var dfd = new $.Deferred,
				$form = $(el).closest('form');

		if ($form.length) {
			dfd.resolve($(el).closest('form').serializeObject());
		} else {
			dfd.resolve({});
		}

		console.log('formGrabber', prevArgs);

		return dfd.promise();
	},
	removeLoader:function (e, el, prevArgs) {
		$(el).removeClass('working');
		console.log('removeLoader', prevArgs);
	},
	render:function (e, el, prevArgs) {
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
			dfd.resolve(prevArgs);
		}

		console.log('render', prevArgs);

		return dfd.promise();
	},
	smoothRender:function (e, el, prevArgs) {
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
			dfd.resolve(prevArgs);
		}

		console.log('smoothRender', prevArgs);

		return dfd.promise();
	},
	success:function (e, el, prevArgs) {
		console.log('ok', prevArgs);
		alert('ok');
	}
}