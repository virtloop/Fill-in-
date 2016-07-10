/** 
	Global App View
**/


App.Views.App = Backbone.View.extend({
	el: '#content',
	events: {
		'focusout #teacher_view .blank': 'addSolution'
	},
	attempt: 0,

	initialize: function() {
		"use strict";
		var teacherView = new App.Views.Teacher({collection: App.solutions});
		var studentView = new App.Views.Student({collection: App.solutions});

		
		teacherView.render();
		studentView.render();
	},

	solutionMgr: function (array) {
		"use strict";

		var fields = array.replace( /\|\s?\/\>/g, "|" ).split( '|' );
		return fields;
	},

	addSolution: function (e) {
		"use strict";
		e.preventDefault();
		var solutionId = $( e.currentTarget ).attr( 'data-id' );
		var blankId = $( e.currentTarget ).attr( 'id' );

		var solutionArray = this.solutionMgr($( '#blank' + solutionId ).val());
		//am presupus ca profesorul nu va gresi cand va adauga solutiile...
		
		if( $( '#blank' + solutionId ).val() !== '' ){
			this.collection.add({
				id: solutionId,
				solution: solutionArray
			});
		}
		//console.log(this.collection);
	}

});


/** 
	Teacher View
**/

App.Views.Teacher = Backbone.View.extend({
	el: '#teacher_view',
	title: 'teacher view',
	countClick : 0,
	events: {
		'click #new' : 'addBlank',
		'click #remove' : 'removeBlank'
	},

	render: function () {
		"use strict";
		var text_placeholder = $('#sentence').attr('data-placeholder');
		$('#page-title').html(this.title);
		
		$('#sentence').each(function(){
		    this.contentEditable = true;
		});

		$('#sentence').text(text_placeholder);
	},

	
	addBlank: function (e) {
		"use strict";
		this.countClick++;
		$('#sentence').append('<input id="blank'+ this.countClick + '" class="blank" data-id="'+this.countClick+'">');
		
		$('.blank').focus();
	},

	removeBlank: function (e) {
		"use strict";
		$('#blank' + this.countClick).remove();
		this.countClick--;
		
		$('#blank' + this.countClick).focus();
	},
});


/** 
	Student View
**/

App.Views.Student = Backbone.View.extend({
	el: '#content',
	title: 'student view',
	template: template('feedback_modal'),
	attempt: 0,
	currentAttempt: 0,
	events: {
		'click #check': 'check_response',
		'change #attempts': 'get_attempts_value',
		'click #retry': 'retry_answer',
		'click #view_solution': 'showSolution'
	},

	get_attempts_value: function (e){
		"use strict";
		this.attempt = this.currentAttempt = $(e.currentTarget).val();

		//this.currentAttempt = this.attempt - this.currentAttempt;
	},

	render: function() {
		'use strict';
		var sentence = '';
		
		$('#content').prepend('<div id="student_view"></div>')
		$('#preview').attr('title', this.title);
		
		$('#student_view').hide();
		

		$('#preview').click(function (e) {
			e.preventDefault();
			$('#preview').addClass('hideShowPassword-toggle-hide');
			$('#page-title').html(this.title).removeClass('teacher-color').addClass('student-color');
			
			$('#teacher_view').hide();
			$('#student_view').show();
			if($('#instr_teacher').val() !== '') {
				$('#student_view').append('<p class="instr"><strong>'+ $('#instr_teacher').val() +'</strong></p>');
			}

			if($('#sentence').text() !== '' && $('#instr_teacher').val() !== ''){
				$('.instr').after('<p class="sentence">'+ $('#sentence').html() +'</p>');
			}else if($('#sentence').text() !== ''){
				$('#student_view').append('<p class="sentence">'+ $('#sentence').html() +'</p>');	
			}else{
				$('#student_view').append('There is no text to show');
			}
			if($('#student_view').is(':visible')){
				$('#student_view').append('<div class="footer_controls pull-right"></div>');

				$('.footer_controls').append('<button class="btn btn-primary disabled" id="view_solution">Solution</button>');
				$('.footer_controls').append('<button class="btn btn-primary student-color" id="check">Check</button>');
				$('.footer_controls').append('<button class="btn btn-primary student-color" id="retry">Retry</button>');
				$('#retry').hide();
			}
		});
	},

	check_response: function () {
		"use strict";
		var i, j, solObj, answer, eval_sentence = true, score;

		App.solutions.each(function(){
			
			solObj = App.solutions.toJSON();
			
			for(i = 0; i < solObj.length; i++ ) {

				answer = $('#student_view #blank' + solObj[i].id).val();
				if(solObj[i].solution.length > 1){
					for( j = 0; j < solObj[i].solution.length; j++ ) {
						if(solObj[i].solution[j] == answer){
							$('#student_view #blank' + solObj[i].id).addClass('correctAnswer');
							break;
						}else{
							$('#student_view #blank' + solObj[i].id).addClass('wrongAnswer');
						}
					}
				}else{
					if(solObj[i].solution == answer){
						$('#student_view #blank' + solObj[i].id).addClass('correctAnswer');	
					}else{
						$('#student_view #blank' + solObj[i].id).addClass('wrongAnswer');
					}	
				}	
			}
		});

		
		
		if(this.currentAttempt > 1){
			$('#student_view .blank').each(function(){
				if( $(this).hasClass('wrongAnswer') ){
					eval_sentence = false;
				}
			});

			if(!eval_sentence){
				$('#check').hide();
				$('#retry').show();
				this.currentAttempt--;
			}else{
				score = 10 - ( ( this.attempt - this.currentAttempt )/this.attempt );

				this.openPopup('Correct', score);

				//alert('Your score is: ' + score);
				$('#check').hide();
			}
		}else{
			$('#view_solution').removeClass('disabled');
			$('#check').hide();
		}
	},
	retry_answer: function () {
		$('#check').show();
		$('#retry').hide();
		$('#student_view .blank').val('');

		$('#student_view .blank').each(function () {
			$(this).removeClass('correctAnswer').removeClass('wrongAnswer');
		});
		
	},

	openPopup: function ( feedbackTitle, score ) {
		"use strict";

		$('#content').append( this.template( score ) );

		$('#myModal .modal-title').html(feedbackTitle);
		$('#myModal .modal-body p').html("Your score is: " + score);
		$('#myModal').modal('show');

	},

	showSolution: function (){
		"use strict";
		var i, j, solObj, answer;				

		App.solutions.each(function(){
				
				solObj = App.solutions.toJSON();
				console.log(solObj)
				for(i = 0; i < solObj.length; i++ ) {
					answer = $('#student_view #blank' + solObj[i].id).val();
					for( j = 0; j < solObj[i].solution.length; j++ ) {
						
						$('#student_view #blank' + solObj[i].id).val(solObj[i].solution);
					}
				}
			});
	}	
});

/** 
	Solution View
**/

App.Views.Solution = Backbone.View.extend({
	el: 'div'

});