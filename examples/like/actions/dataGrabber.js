App.actions.dataGrabber = function (e, el, prevArgs) {
	var dfd = new $.Deferred,
		$dataSource = $(el).closest('[role="block"]');

	if ($dataSource.length) {
		dfd.resolve($dataSource.data());
	}
	else {
		dfd.resolve({});
	}

  return dfd.promise();
};