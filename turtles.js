
  var hbmpize = function(pre) {
    var rows = $(pre).text().split("\n");
    var t = $("<table/>").attr("style",
      "border: 1px solid black; border-collapse: collapse; display: table;");
    $(rows).each(function() {
      if( !this.length ) return; 
      var r = $("<tr/>").appendTo(t);
      var cols = this.split(",");
      $(cols).each(function() {
        if( !this.length ) return;
        var x = this.split(" ");
        var bg = x[0];
        var c = $("<td/>").attr("style",
            "padding: 0; border: 1px solid black; background-color: " + bg)
            .attr("width", "50px").attr("height", "50px")
            .appendTo(r);
        if( x[1] )
          c.addClass(x[1]);
      });
    });
    $(pre).replaceWith(t);
    return t;
  };

var processKey = function(event) {
  if( event.which == 97 ) {
    lf(turtles[3]);
  };
  if( event.which == 115 ) {
    fd(turtles[3]);
  };
  if( event.which == 100 ) {
    rt(turtles[3]);
  };
  if( event.which == 119 ) {
    bk(turtles[3]);
  };
  
};

turtle = function(x, y, color) {
  var seed = paper.circle(x, y, 10);
  seed.attr("fill", color);
  seed.attr("stroke", "black");
  var line = paper.path("M" + x + " " + y);
  line.attr("stroke", color);
  line.attr("stroke-width", 3);
  seed.line = line;
  seed.pd = 1;
  seed.angle = 0;
  seed.queue = [];
  var head = paper.circle(x, y+10, 5);
  head.attr("fill", color);
  head.attr("stroke", "black");
  seed.head = head;
  return seed;
};

processQueue = function(t) {
  if( t.queue.length == 0 ) return;
  var i = t.queue.shift();
  if( i == "" ) return;
  i = i.split(" ");
  var cmd = i.shift();
  var processCmd = function(cmd) { 
    switch(cmd) {
     case "fwd":
      fd(t); break;
     case "back":
      bk(t); break;
     case "left":
      lf(t); 
      break;
     case "right":
      rt(t); break;
     case "pendown":
      t.pd = 1; break;
     case "penup":
      t.pd = 0; break;
     case "fetch":
      fetch(t, i[0]); break;
     case "paint":
      paint(t); break;
     case "move":
      var pos = cellPos(t.table, i[0], i[1]);
      if( !pos ) return;
      t.pos.x = parseInt(i[1]); t.pos.y = parseInt(i[0]);
      move(t, pos.x, pos.y);
      break;
     case "color":
      color(t, i[0]); break;
    };
  };
  processCmd(cmd);
};

runWorld = function(ts) {
  for( var i = 0; i < ts.length; ++i ) {
      processQueue(ts[i]);
  };
  window.setTimeout(function() { runWorld(ts); }, 750);
};

fetch = function(t, url) {
  $.get(url, function(doc) {
    doc = doc.split("\n");
    $(doc).each(function() {
      t.queue.push(this);
    });
  });
};

color = function(turtle, nc) {
  turtle.attr("fill", nc);
  //turtle.attr("stroke", nc);
  var x = turtle.attr("cx"),
      y = turtle.attr("cy");
  var line = paper.path("M" + x + " " + y);
  line.attr("stroke", nc);
  line.attr("stroke-width", 3);
  turtle.line = line;
};

tableturtle = function(table, col, row, color) {
  var pos = cellPos(table, row, col);
  var t = turtle(pos.x, pos.y, color);
  var cell = table.find("td:first");
  t.pos = {x: col, y: row};
  t.or = {x: 0, y: 1};
  t.table = table;
  return t;
};

fixHead = function(x, y, t) {
  var head = t.head;
  var r = t.attr("r");
  //var x = t.attr("cx"),
  //    y = t.attr("cy");

  var newAttrs = {cx: x + ( t.or.x * r ),
                  cy: y + ( t.or.y * r )};
  return newAttrs;
};

fd = function(t) {
  var pos = {};
  pos.x = t.pos.x + t.or.x;
  pos.y = t.pos.y + t.or.y;
  var cell = getCell(t.table, pos.y, pos.x);
  if( cell.length == 0 ) { return;}
  var to = cellPos(t.table, pos.y, pos.x);
  if( !accepts(cell, t) ) { return;}
  t.pos = pos;
  move(t, to.x, to.y, function() { actUpon(cell, t); });
};

accepts = function(cell, t) {
  if( $(cell)[0].style.backgroundColor == "black" ) return 0;
  return 1;
};

paint = function(t) { 
  var cell = getCell(t.table, t.pos.y, t.pos.x);
  var c = t.attr("fill");
  $(cell).css("backgroundColor", c);
  actUpon(cell, t);
};

actUpon = function(cell, t) {
  var col = $(cell)[0].style.backgroundColor;
  if( $(cell).attr("class") != "" ) {
    var pos = $(cell).attr("class");
    pos = pos.split("-");
    pos = {x: parseInt(pos[1]), y: parseInt(pos[0])};
    t.pos = pos;
    pos = cellPos(t.table, pos.y, pos.x);
    t.attr("cx", pos.x).attr("cy", pos.y);
    var headPos = fixHead(pos.x, pos.y, t);
    t.head.attr({cx: headPos.cx, cy: headPos.cy});
    var line = paper.path("M" + pos.x + " " + pos.y);
    line.attr("stroke", t.attr("fill"));
    line.attr("stroke-width", 3);
    t.line = line;

    return;
  };
  if( col != "white" ) {    
    color(t, col);
  };
};

bk = function(t) {
  t.or.x *= -1;
  t.or.y *= -1;
  fixHeadNoMove(t);
};

rt = function(t) {
  t.or.x *= -1;
  t.or.y *= -1;
  lf(t);  
};

fixHeadNoMove = function(t, noAnimate) {
      var headPos = fixHead(t.attr("cx"), t.attr("cy"), t); 
   if( noAnimate ) {
     t.head.attr(headPos);
   } else {		     
      t.head.animate(headPos, 500);
   }
};

lf = function(t) {
  if( t.or.x == 1 && t.or.y == 0 ) {
    t.or.x = 0; t.or.y = -1;
    fixHeadNoMove(t);
//fd(t);
    return;
  };
  if( t.or.x == 0 && t.or.y == -1 ) {
    t.or.x = -1; t.or.y = 0;
    fixHeadNoMove(t);
    //fd(t);
    return;
  };
  if( t.or.x == -1 && t.or.y == 0 ) {
    t.or.x = 0; t.or.y = 1;
    fixHeadNoMove(t);
    //fd(t);
    return;
  };
  if( t.or.x == 0 && t.or.y == 1 ) {
    t.or.x = 1; t.or.y = 0;
    fixHeadNoMove(t);
    //fd(t);
    return;
  };
};

fwd = function(turtle, l) {
  var angle = turtle.angle;
  angle = angle * Math.PI / 180;
  var x = l * Math.sin(angle);
  var y = l * Math.cos(angle);
  x = turtle.attr("cx") + x;
  y = turtle.attr("cy") + y;
  move(turtle, x, y);
};

move = function(turtle, x, y, callback) {
  callback = callback || function() { return; };
  var _callback = function() {
    callback();
  };
  var line = turtle.line;
  var path = line.attr("path");
  var headPos = fixHead(x, y, turtle);
  if( turtle.pd == 1 ) {
    turtle.animate({cx: x, cy: y}, 500, _callback);
    line.animateWith(turtle, {path: path + "L" + x + " " + y}, 500);
    turtle.head.animateWith(turtle, headPos, 500);
  } else {
    turtle.animate({cx: x, cy: y}, 500, _callback);
    line.attr("path", path + "M" + x + " " + y);
    turtle.head.animateWith(turtle, headPos, 500);
  }
};

rows = function(table) {
  return $("#grid table tr").length;
};

cols = function(table) {
  return $("#grid table td").length / rows(table);
};

getCell = function(table, row, col) {
  row = $($("#grid table tr")[row]);  
  return $($(row).children("td")[col]);
};

cellPos = function(table, row, col) {
  var cell = getCell(table, row, col);
  if( cell.length == 0 ) return;
  return getCellPos(cell);
};

getCellPos = function(cell) {
  cell = $(cell);
  var pos = cell.position();
  var h = cell.height(),
      w = cell.width();
  var x = pos.left + w/2;
  var y = pos.top + h/2;
  return {x: x, y: y};
};