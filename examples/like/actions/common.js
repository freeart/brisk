App = {
	actions: {}
}

App.actions.common = {
	addLoader: function (e, el, prevArgs) {
		if (!$(el).hasClass('working')) {
			$(el).addClass('working');
		} else {
			return false;
		}
		console.log('addLoader', prevArgs);
	},
	dataGrabber: function (e, el, prevArgs) {
		var $el = $(el),
			$block = $el.closest('[role=block]'),
			blockData = $block.data(),
			elData = $.extend(true, {}, blockData, $el.data());

		console.log('dataGrabber', prevArgs);

		return elData;
	},
	formGrabber: function (e, el, prevArgs) {
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
	removeLoader: function (e, el, prevArgs) {
		$(el).removeClass('working');
		console.log('removeLoader', prevArgs);
	},
	render: function (e, el, prevArgs) {
		var dfd = new $.Deferred,
			error = false;

		$.each(prevArgs, function (selector, config) {
			var $target = $(selector);

			config.html = config.html || '&nbsp;';

			switch (config.mode) {
				case 'replace':
					$target.html(config.html);
					break;

				case 'replaceWith':
					$target.replaceWith(config.html);
					break;

				case 'append':
					$target.append(config.html);
					break;

				case 'prepend':
					$target.prepend(config.html);
					break;

				case 'delete':
					$target.promise().done(function () {
						$(this).remove()
					});
					break;

				case 'after':
					$target.after(config.html);
					break;

				case 'before':
					$target.before(config.html);
					break;

				case 'redirect':
					window.location.href = config.url;
					break;

				case 'refresh':
					window.location.reload();
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
	stopPropagation: function (e) {
		e.stopPropagation();
	},

	stopImmediatePropagation: function (e) {
		e.stopImmediatePropagation();
	},

	preventDefault: function (e) {
		e.preventDefault();
	},

	stopEvent: function (e) {
		e.preventDefault();
		e.stopPropagation();
	},
	success: function (e, el, prevArgs) {
		console.log('ok', prevArgs);
		alert('ok');
	}
}