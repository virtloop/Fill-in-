App.Models.Solution = Backbone.Model.extend({
	validate: function ( attrs ) {
		"use strict";
		debugger;
		if( !attrs.id || !attrs.solution ){
			return 'You must enter a solution for this blank input';
		}
	}

});