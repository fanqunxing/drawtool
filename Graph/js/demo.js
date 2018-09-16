var canvas = document.getElementById('canvas');
var setting = {
	lineColor: '#26b7d0',
	lineHoverColor: '#aaa',
	arrowColor: '#444',
	lineStyle: 'arrow' // none
}

var drawTool = new DrawTool(canvas, setting);

addNode(20, 20);
addNode(140, 140);
addNode(200, 140);
addNode(140, 200);
function addNode(x, y) {
	var type = $("#type").val();
	var text = $('#text').val();
	var option = {
		pos:{x:x,y:y},
		html:"<div class='node js-node'>\
				<div class='in " + type + "'>"+ text +"</div>\
				<button class=\"option\">删除</button>\
			  </div>",
		// html: "<div class='node js-node'>"+ String.fromCharCode(index) +"</div>",
		anchors:[[0, 20],[40, 20],[20, 0],[20, 40]]
	};
	drawTool.addNode(option);
};

/*
drawTool.listen({
	clickLine: function( line ) {
		console.log( line );
	},
	deleteLineBefore: function(line) {
		return true;
	},
	deleteLineAfter: function(line) {
		console.log(line);
	},
	linkLineBefore: function(line) {
		return true;
	},
	linkLineAfter: function(line) {
		console.log(line);
	}
});

drawTool.listen('clickLine', function(line) {
	console.log(line);
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
*/



