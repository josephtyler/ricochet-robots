var Robots = (function() {

  var h = 4, w = 4,
      $wrapper,
      $square;

  function buildBoard() {
    var mtx = [], y,
        square,
        red = {},
        blue = {},
        destination = {},
        board = {};

    for (var i=0; i<h; i++) {
      y = [];
      for (var j=0; j<w; j++) {
        square = {};
        square.north = (i == 0);
        square.south = (i == (h - 1));
        square.west = (j == 0);
        square.east = (j == (w - 1));
        square.x = j;
        square.y = i;
        square.piece = null;
        y.push(square);

      }
      mtx.push(y);
    }

    // Tmp barriers
    mtx[3][1].east = true;
    mtx[0][2].south = true;

    // Piece and destination coordinates
    board.mtx = mtx;
    board.pieces = {
      red: {x: 0, y: 0, color: 'red'},
      // blue: {x: 2, y: 2, color: 'blue'}
      blue: {x: 3, y: 1, color: 'blue'}
    };
    // board.destination = {x: 2, y: 3};
    board.destination = {x: 1, y: 1};
    board.mtx[0][0].piece = board.pieces.red;
    board.mtx[1][3].piece = board.pieces.blue;

    return board;
  }

  function display(board, adjacencyList) {
    var $row, y, sq,
        mtx = board.mtx,
        aList, aListText;

    $wrapper = $("#game");

    for (var i=0; i<mtx.length; i++) {
      $row = $("<div />").addClass("row");
      y = mtx[i];

      for (var j=0; j<y.length; j++) {
        sq = y[j];
        $square = $("<div />").addClass("square");
        for (var piece in board.pieces) {
          if (i == board.pieces[piece].y && j == board.pieces[piece].x) {
            $square.addClass(piece);
          }
        }
        if (i == board.destination.y && j == board.destination.x) $square.addClass("destination");
        if (sq.north) $square.addClass("north");
        if (sq.south) $square.addClass("south");
        if (sq.west) $square.addClass("west");
        if (sq.east) $square.addClass("east");

        // Adj list text
        aList = adjacencyList[i][j];
        aListText = [];
        for (var a=0; a<aList.length; a++) {
          aListText.push(aList[a].x + " " + aList[a].y);
        }
        $square.html(aListText.join("<br>"));
        $row.append($square);
      }
      $wrapper.append($row);
    }
  }

  function buildAdjacencyList(board) {
    var row, sq, lst = Array(h),
        mtx = board.mtx;

    for (var y=0; y<mtx.length; y++) {
      row = mtx[y];
      lst[y] = Array(w);

      for (var x=0; x<row.length; x++) {
        lst[y][x] = [];
        sq = row[x];
        south = calculateSouth(board, sq);
        if (south !== sq) lst[y][x].push(south);
        north = calculateNorth(board, sq);
        if (north !== sq) lst[y][x].push(north);
        west = calculateWest(board, sq);
        if (west !== sq) lst[y][x].push(west);
        east = calculateEast(board, sq);
        if (east !== sq) lst[y][x].push(east);
      }
    }

    return lst;
  }

  function calculateSouth(board, sq) {
    var squareSouth, rowSouth;

    if (sq.south) return sq;

    squareSouth = board.mtx[sq.y + 1][sq.x];
    if (squareSouth.north || squareSouth.piece) return sq;

    return calculateSouth(board, squareSouth);
  }

  function calculateNorth(board, sq) {
    var square, rowNorth;

    if (sq.north) return sq;

    squareNorth = board.mtx[sq.y - 1][sq.x];
    if (squareNorth.south || squareNorth.piece) return sq;

    return calculateNorth(board, squareNorth);
  }

  function calculateWest(board, sq) {
    var square, rowWest;

    if (sq.west) return sq;

    squareWest = board.mtx[sq.y][sq.x - 1];
    if (squareWest.east || squareWest.piece) return sq;

    return calculateWest(board, squareWest);
  }

  function calculateEast(board, sq) {
    var square, rowEast;

    if (sq.east) return sq;

    squareEast = board.mtx[sq.y][sq.x + 1];
    if (squareEast.west || squareEast.piece) return sq;

    return calculateEast(board, squareEast);
  }

  function solve(board, adjacencyList, source, destination) {
    var bookKeeper = new Array(),
        queue = new Array(),
        vertex;

    // Initialize bookkeeper
    for (var i=0; i<h; i++) {
      y = [];
      for (var j=0; j<w; j++) {
        y.push({visited: false, pred: null});
      }
      bookKeeper.push(y);
    }

    queue.push(board.mtx[source.y][source.x]);
    bookKeeper[source.y][source.x].visited = true;

    while (queue.length) {
      vertex = queue.splice(0, 1)[0];
      console.log('vertex', vertex, vertex.x, vertex.y);
      // If we find a solution
      if (vertex.x == destination.x && vertex.y == destination.y) {
        console.log('solution found, walking up');
        pred = bookKeeper[vertex.y][vertex.x].pred;
        predList = [board.mtx[destination.y][destination.x]];
        while (pred !== null) {
          predList.push(pred);
          pred = bookKeeper[pred.y][pred.x].pred;
        }
        return predList;
      }
      console.log('al', adjacencyList);
      console.log('vy, vx', vertex.y, vertex.x);
      adjList = adjacencyList[vertex.y][vertex.x];
      for (var i=0; i<adjList.length; i++) {
        w = adjList[i];
        if (!bookKeeper[w.y][w.x].visited) {
          bookKeeper[w.y][w.x].visited = true;
          bookKeeper[w.y][w.x].pred = vertex;
          queue.push(w);
        }
      }
    }

    return [];
  }

  function init() {
    var board, adjencyList, solution;

    board = buildBoard();
    adjacencyList = buildAdjacencyList(board);
    display(board, adjacencyList);
    window.board = board;
    solution = solve(board, adjacencyList, {x: 0, y: 0}, board.destination);
    console.log('solution', solution);
  }

  return {init: init};

})();

$(Robots.init);
