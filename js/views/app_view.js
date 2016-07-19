/** 
	Global App View
**/

App.Views.App = Backbone.View.extend({
	el: '#content',
	
	events: {
		
		'click #preview': 'preview_mode' 
	},

	title_container: $('#page-title'),

	MODE: {
		init_mode: true,

		teacher: {
			'selector': $('#teacher_view'),
			'title': 'Teacher View',
			'color_class' : 'teacher-color',
			'buttons' : [
				{name:'New Input', id:'new', class: 'btn btn-primary'},
				{name:'Delete Input', id:'remove', class: 'btn btn-danger'}
			],
		},

		student: {
			'selector': $('#student_view'),
			'title': 'Student View',
			'color_class' : 'student-color',
			'buttons' : [
				{name:'Solution', id:'view_solution', class: 'btn btn-primary disabled'},
				{name:'Check', id:'check', class: 'btn btn-primary'},
				{name:'Retry', id:'retry', class: 'btn btn-primary hide'}
			],
		}
	},

	attempt: 0,

	initialize: function() {
		"use strict";
		var teacherView = new App.Views.Teacher({collection: App.solutions});
		this.title_container.html(teacherView.title).addClass(this.MODE.teacher.color_class);

		console.log(App.model)

		teacherView.render();
		$('.button_group').html('');
		this.writeButtons(this.MODE.teacher.buttons);
	},

	preview_mode: function (e) {
		"use strict";

		this.MODE.init_mode = !this.MODE.init_mode;

		if( !this.MODE.init_mode ) {
			e.preventDefault();
			var studentView = new App.Views.Student({collection: App.solutions});
			studentView.render();
			this.MODE.teacher.selector.html('');

			//changing page title
			this.title_container.html(studentView.title).removeClass(this.MODE.teacher.color_class).addClass(this.MODE.student.color_class);
			$('.button_group').html('');

			//writing buttons
			this.writeButtons(this.MODE.student.buttons);
			$('#preview').addClass('hideShowPassword-toggle-hide').attr('title', 'Edit Mode');

		} else {
			var teacherView = new App.Views.Teacher({collection: App.solutions});
			
			teacherView.render();
			this.MODE.student.selector.html('');

			//changing page title
			this.title_container.html(teacherView.title).removeClass(this.MODE.student.color_class).addClass(this.MODE.teacher.color_class);
			$('.button_group').html('');

			//writing buttons
			this.writeButtons(this.MODE.teacher.buttons);
			$('#preview').removeClass('hideShowPassword-toggle-hide').attr('title', 'Preview Mode');
		}
	},

	writeButtons: function (btnsObj) {
		"use strict";
		$('.footer_controls').html('<button id="preview" title="Preview Mode" class="btn btn-default"></button><div class="button_group col-md-4"></div>');

		$.each(btnsObj, function (){
			
			$('.button_group').append('<buttons class="'+ this.class +'" >'+this.name+'</buttons>');
		});
	}
});


/** 
	Teacher View
**/
App.Views.Teacher = Backbone.View.extend({
	el: '#content',
	title: 'teacher view',
	container: $('#teacher_view'),
	countClick : 0,
	focused: null,
	events: {
		'focusin .blank': 'focusedBlank',
		'focusout .blank': 'losefocusedBlank',
		'click #new' : 'addBlank',
		'click #remove' : 'removeBlank',
		'focusout #teacher_view .blank': 'addSolution',
		'blur #sentence': 'saveSentence'
	},

	render: function () {
		"use strict";
		this.writeInstrInput(this.container);
		this.writeTextArea(this.container);
		

	},

	writeInstrInput: function (container) {
		"use strict";
		
		var inputAttr = [
							{ key: 'type', value: 'text' },
							{ key: 'class', value: 'form-control' },
							{ key: 'id', value: 'instr_teacher' },
							{ key: 'placeholder', value: 'Type here the work instruction' },
							{ key: 'autocomplete', value: 'off' },
						]

		$(container).append('<div class="instr form-group"><input/></div>')

		$.each( inputAttr, function(){
			
			$('.instr input').attr(this.key, this.value);
		} );

	}, 

	writeTextArea: function (container) {
		"use strict";
		var textareaAttr = [
								{ key: 'class', value: 'form-control' },
								{ key: 'data-placeholder', value: 'Start typing here the text. Add blanks using New Input button bellow' },
								{ key: 'id', value: 'sentence' },
								{ key: 'contenteditable', value: 'true' }
						   ];
		var text_placeholder;
		$(container).append('<div class="sentence form-group"><div></div></div>');

		$.each(textareaAttr, function(){
			$('.sentence div').attr(this.key, this.value);
			
			if(this.key === 'data-placeholder'){
				$('.sentence div').text(this.value);
			}
		});
	},

	saveSentence: function () {
		"use strict";
	},

	addBlank: function (e) {
		"use strict";
		this.countClick++;

		var sel = window.getSelection(), range;
		var html = '<input id="blank'+ this.countClick + '" class="blank" data-id="'+this.countClick+'">';
		//stackoverflow
		if( sel ){
			//debugger
			if ( sel.getRangeAt && sel.rangeCount ) {
				range = sel.getRangeAt(0);
            	range.deleteContents();

            	var el = document.createElement("div");
            	el.innerHTML = html;
            	var frag = document.createDocumentFragment(), node, lastNode;
	            while ( (node = el.firstChild) ) {
	                lastNode = frag.appendChild(node);
	            }
	            var firstNode = frag.firstChild;
	            range.insertNode(frag);
	            
	            // Preserve the selection
	            if (lastNode) {
	                range = range.cloneRange();
	                range.setStartAfter(lastNode);
	                range.setStartBefore(firstNode);
	                sel.removeAllRanges();
	                sel.addRange(range);
	            }
			}
		}

		$('#blank' + this.countClick).focus();
	},

	focusedBlank: function (e) {
		this.focused = e.currentTarget;
	},

	losefocusedBlank: function () {
		this.focused = null;
	},
	
	removeBlank: function () {
		"use strict";
		
		if( this.focused === null ){
			$('#blank' + this.countClick).remove();
			this.countClick--;
			$('#blank' + this.countClick).focus();
		}else{
			this.focused.remove();	
		}
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
	}
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
	},

	render: function() {
		'use strict';
		var sentence = '';
		
		if( $('#instr_teacher').val() !== '' ) {
			$('#student_view').append('<p class="instr"><strong>'+ $('#instr_teacher').val() +'</strong></p>');
		}

		if($('#sentence').text() !== '' && $('#instr_teacher').val() !== ''){
			$('.instr').after('<p class="sentence">'+ $('#sentence').html() +'</p>');
		}else if($('#sentence').text() !== ''){
			$('#student_view').append('<p class="sentence">'+ $('#sentence').html() +'</p>');	
		}else{
			$('#student_view').append('There is no text to show');
		}
		//$('#teacher_view').html('');
		/*if($('#student_view').is(':visible')){
			$('.footer_controls').addClass('pull-right');
			//$('#student_view').append('<div class="footer_controls pull-right"></div>');
			$('.button_group').html('');
			$('.button_group').append('<button title="Preview Mode" id="preview" class="btn btn-default"></button>');
			$('.button_group').append('<button class="btn btn-primary disabled" id="view_solution">Solution</button>');
			$('.button_group').append('<button class="btn btn-primary student-color" id="check">Check</button>');
			$('.button_group').append('<button class="btn btn-primary student-color" id="retry">Retry</button>');
			$('#retry').hide();
		}*/
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


App.Views.Solution = Backbone.View.extend({
	el: 'div'

});**/