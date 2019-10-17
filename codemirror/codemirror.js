webix.protoUI({
	name:"codemirror-editor",
	defaults:{
		mode:"javascript",
		lineNumbers:true,
		matchBrackets:true,
		theme:"default"
	},
	$init:function(config){
		this.$view.innerHTML = "<textarea style='width:100%;height:100%;'></textarea>";
		this._waitEditor = webix.promise.defer();
		this.$ready.push(this._render_cm_editor);
	},
	_render_cm_editor:function(){

		if (this.config.cdn === false){
			this._render_when_ready;
			return;
		};

		var cdn = this.config.cdn || "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/";
		// basic
		var sources = [
			cdn+"/codemirror.css",
			cdn+"/codemirror.js"
		];

		// mode
		var mode = this.config.mode ? this.config.mode : "javascript";
		if (mode.indexOf("html") === 0) {
			sources.push(cdn + "/mode/xml/xml.js");
			sources.push(cdn + "/mode/css/css.js");
			sources.push(cdn + "/mode/javascript/javascript.js");
			if (mode === "htmlembedded") {
				sources.push(cdn + "/mode/htmlmixed/htmlmixed.js");
				sources.push(cdn + "/addon/mode/multiplex.js");
			}
		};
		sources.push(cdn + "/mode/" + mode + "/" + mode + ".js");

		// theme
		if (this.config.theme && this.config.theme !== "default"){
			sources.push(cdn+"/theme/"+this.config.theme+".css")
		};

		// matchbrackets add-on
		if(this.config.matchBrackets){
			sources.push(cdn+"/addon/edit/matchbrackets.js")
		};

		webix.require(sources)
		.then( webix.bind(this._render_when_ready, this) )
		.catch(function(e){
			console.log(e);
		});		
	},
	_render_when_ready:function(){
		this._editor = CodeMirror.fromTextArea(this.$view.firstChild, {
			mode: this.config.mode,
			lineNumbers: this.config.lineNumbers,
			matchBrackets: this.config.matchBrackets,
			theme: this.config.theme
		});

		this._waitEditor.resolve(this._editor);

		this.setValue(this.config.value);
		if (this._focus_await)
			this.focus();
	},
	_set_inner_size:function(){
		if (!this._editor || !this.$width) return;

		this._updateScrollSize();
		this._editor.scrollTo(0,0); //force repaint, mandatory for IE
	},
	_updateScrollSize:function(){
		var box = this._editor.getWrapperElement();
		var height = (this.$height || 0) + "px";

		box.style.height = height;
		box.style.width = (this.$width || 0) + "px";

		var scroll = this._editor.getScrollerElement();
		if (scroll.style.height != height){
			scroll.style.height = height;
			this._editor.refresh();
		}
	},
	$setSize:function(x,y){
		if (webix.ui.view.prototype.$setSize.call(this, x, y)){
			this._set_inner_size();
		}
	},
	setValue:function(value){
		if(!value && value !== 0)
			value = "";

		this.config.value = value;
		if(this._editor){
			this._editor.setValue(value);
			//by default - clear editor's undo history when setting new value
			if(!this.config.preserveUndoHistory)
				this._editor.clearHistory();
			this._updateScrollSize();
		}
	},
	getValue:function(){
		return this._editor?this._editor.getValue():this.config.value;
	},
	focus:function(){
		this._focus_await = true;
		if (this._editor)
			this._editor.focus();
	},
	getEditor:function(waitEditor){
		return waitEditor?this._waitEditor:this._editor;
	},
	//undo, redo, etc
	undo:function(){
		this._editor.undo();
	},
	redo:function(){
		this._editor.redo();
	},
	undoLength:function(){
		return this._editor.historySize().undo;
	}
}, webix.ui.view);