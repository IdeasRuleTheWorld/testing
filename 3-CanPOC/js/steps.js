(function() {
    // Organizes pagination state and 
	// provides some helper methods
    var Paginate = can.Observe.extend({
      defaults : {
        count: Infinity,
        offset: 0,
        limit: 100
      }
    },{
      // Prevent negative counts
      setCount: function(newCount, success, error){
        return newCount < 0 ? 0 : newCount;
      },
      // Prevent negative offsets
      setOffset: function(newOffset){
        return newOffset < 0 ? 
            0 : 
            Math.min(newOffset, ! isNaN(this.count - 1) ? 
                     this.count - 1 : 
                     Infinity )
      },
      // move next
      next: function(){
        this.attr('offset', this.offset+this.limit);
      },
      prev : function(){
        this.attr('offset', this.offset - this.limit )
      },
      canNext : function(){
        return this.attr('offset') < this.attr('count') - 
                this.attr('limit')
      },
      canPrev: function(){
        return this.attr('offset') > 0
      },
      page: function(newVal){
      	if(newVal === undefined){
      	  return Math.floor( this.attr('offset') / this.attr('limit') )+1;
      	} else {
  		  this.attr('offset', ( parseInt(newVal) - 1 ) * this.attr('limit') );
      	}
      },
      pageCount: function(){
      	return this.attr('count') ? 
      		Math.ceil( this.attr('count')  / this.attr('limit') )
      		: null;
      }
    });

	// Hooks up client state to can.route and
	// various controls.
	var AppControl = can.Control.extend({
	  init: function(){
		// Create an Observe that organizes
		// the page's state.
	    var paginate = this.options.paginate = new Paginate({
	        limit: 5
	    });
	    
	    // Create widget that uses the page's state.
	    new NextPrev("#nextprev",{paginate: paginate});
	    
	    // Create widget by mapping page's state
	    // to the options the widget it accepts.
	    new PageCount("#pagecount",{
          page: can.compute(paginate.page,paginate),
          pageCount: can.compute(paginate.pageCount,paginate)
	    });

		// Map the page state the
		// the list of options the grid
		// should display
		var items = can.compute(function(){
          var params = {
            limit: paginate.attr('limit'),
            offset: paginate.attr('offset')
          };
          var websitesDeferred = Website.findAll(params);
          websitesDeferred.then(function(websites){ paginate.attr('count', websites.count) });
          return websitesDeferred
	    })
	    
	    // Create the grid.
	    new Grid("#websites",{
          items: items,
          template: "websiteStache"
	    });
	    // Call on to be able to listen to this.options.paginate
		this.on();
	  },
	  // update the route when the page state changes
	  "{paginate} offset": function(paginate){
	  	can.route.attr('page', paginate.page());
	  },
	  // update the page's state when the route changes
	  "{can.route} page": function(route){
	  	this.options.paginate.page(route.attr('page'));
	  }
	});
	
	var Website = can.Model.extend({
      findAll: "/websites"
    },{});
    
   
    can.fixture("/websites",function(request){
      var websites = [
          {id:1,name:"CanJS",url:"http://canjs.us"},{id: 2,name:"jQuery++",url:"http://jquerypp.com"},
          {id:3,name:"JavaScriptMVC",url:"http://javascriptmvc.com"},{id: 4,name:"Bitovi",url:"http://bitovi.com"},
          {id:5,name:"FuncUnit",url:"http://funcunit.com"},{id: 6,name:"StealJS",url:"http://stealjs.com"},
          {id:7,name:"jQuery",url:"http://jquery.com"},{id: 8,name:"Mootools",url:"http://mootools.com"},
          {id:9,name:"Dojo",url:"http://dojo.com"},{id: 10,name:"YUI",url:"http://yui.com"},
          {id:11,name:"DoneJS",url:"http://donejs.com"},{id: 12,name:"Mindjet Connect",url:"http://connect.mindjet.com"},
          {id:13,name:"JSFiddle",url:"http://jsfiddle.net"},{id: 14,name:"Zepto",url:"http://zepto.com"},
          {id:15,name:"Spill",url:"http://spill.com"},{id: 16,name:"Github",url:"http://github.com"}
      ],
          start = request.data.offset || 0
          end = start + ( request.data.limit || websites.length);
      return {
        count: websites.length,
        data: websites.slice(start, end)
      }
    });
    
    var NextPrev = can.Control.extend({
      init: function(){
        this.element.html( 
           can.view('nextPrevStache',this.options) );     
      },
      ".next click" : function(){
        var paginate = this.options.paginate;
        paginate.attr('offset', paginate.offset+paginate.limit);
      },
      ".prev click" : function(){
        var paginate = this.options.paginate;
        paginate.attr('offset', paginate.offset-paginate.limit );
      }
    });
        
   	var PageCount = can.Control.extend({
      init: function(){
        this.element.html(
            can.view('pageCountStache',this.options))
   	  }
   	});
    
    Grid = can.Control.extend({
      init: function(){
		this.update();
      },
      "{items} change": "update",
      update: function(){
		var items = this.options.items();
		if(can.isDeferred( items )){
		  this.element.find('tbody').css('opacity',0.5)
		  items.then(this.proxy('draw'));
		} else {
		  this.draw(items);
		}
      },
      draw: function(items){
		this.element.find('tbody').css('opacity',1);
		var data = $.extend({}, this.options,{items: items})
		this.element.html( can.view(this.options.template, data) );
      }
    });
        
    new AppControl(document.body);
    
    // Setup a pretty route that defaults to page=1
	can.route(":page",{page: "1"});
        
    
})();