# Grunt-hull-widgets

This is a grunt task that allows to build [Hull.io][] widgets from a source directory.

Check the [documentation](http://hull.io/docs) to learn how to create your own [Hull.io][] widgets.

## Options

* `src`: The root path for the widgets. Defaults to `%PROJECT_ROOT%/widgets/`
* `dest`: The root path for the built widgets. Defaults to `%PROJECT_ROOT%/dist/`
* `namespace`: The namespace the templates will be registered in. It will be Hull.templates.%namespace%. Defaults to `_default`.
* `before`: An array of tasks to be executed before the compilation begins. These tasks will run after the cleaning of `dest` and before the first internal _actual_ build tasks. Defaults to `[]`.
* `after`: An array of tasks to be executed after the building is done. Defaults to `[]`.

##License

MIT

[Hull.io]: http://hull.io

