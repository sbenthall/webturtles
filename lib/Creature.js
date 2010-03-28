var Creature = Base.extend({

    constructor: function(col, row, color, world, size, headSize, myId){
        this.world = world;
    },

    setPos : function(col, row){
        this.pos.x = col;
        this.pos.y = row;
    },

    setPagePos : function(x, y){
	this.body.attr("cx", x);
	this.body.attr("cy", y);
	fixHead(x, y, this);
    }
})