var canvas = document.getElementById('canvas');
var setting = {
	lineColor: '#26b7d0',
	lineHoverColor: '#aaa',
	arrowColor: '#444',
	lineStyle: 'arrow' // none
}

var drawTool = new DrawTool(canvas, setting);


/**
 * 事件监听
 */
drawTool.listen({
	clickLine: function( line ) {
		console.log( line );
	},
	deleteLine: function( line ) {
		return true;
	},
	lineTo: function( line ) {
		console.log( line );
		return true;
	}
});

init();

function save() {
	var lineArr = drawTool.getAllLines();
	var nodeArr = drawTool.getAllNodesInfo();
	localStorage.setItem('lineArr', JSON.stringify(lineArr));
	localStorage.setItem('nodeArr', JSON.stringify(nodeArr));
};

function clearMap() {
	drawTool.clear();
};

function init() {
	var lineArr = JSON.parse(localStorage.getItem('lineArr'));
	var nodeArr = JSON.parse(localStorage.getItem('nodeArr'));
	drawTool.init(nodeArr, lineArr);
};

function addNode() {
	var type = $("#type").val();
	var text = $('#text').val();
	var option = {
		pos:{x:20,y:20},
		html:"<div class='node js-node'>\
				<div class='in " + type + "'>"+ text +"</div>\
				<button class=\"option\">删除</button>\
			  </div>",
		// html: "<div class='node js-node'>"+ String.fromCharCode(index) +"</div>",
		anchors:[[0, 20],[40, 20],[20, 0],[20, 40]]
	};
	drawTool.addNode(option);
};


$("#canvas").delegate('.js-node', 'mousemove', function(e) {
	clearTimeout(this.timer);
});

$("#canvas").delegate('.js-node', 'contextmenu ', function(e) {
	clearTimeout(this.timer);
	$(this).find('.option').show();
});

$("#canvas").delegate('.js-node', 'mouseleave', function() {
	var self = this;
	this.timer = setTimeout(function(){
		$(self).find('.option').hide();
	}, 500);
});

$("#canvas").delegate('.option', 'click', function() {
	var nodeid = $(this).closest('.js-node').get(0).nodeid;
	drawTool.deleteNodeById(nodeid);
});




