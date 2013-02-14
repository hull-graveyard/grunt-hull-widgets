# Grunt-hull-widgets

This is a grunt task that allows to build [Hull.io](http://hull.io) widgets from a source directory.

## Options

* `src`: The root path for the widgets. Defaults to `widgets`
* `dest`: The root path for the built widgets
* `namespace`: The namespace in which the templates will be registered. It will be located at runtime as `Hull.templates.%namespace%`. The default value is `_default`
* `before`: An array of tasks to be executed before the compilation begins. These tasks will occur between the cleaning of `dest` and the first internal task of bu
* `after`: An array of tasks to be executed after the building is done.

##License

MIT

