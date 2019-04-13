/* *****************************************************************
 * [Project]
 *  NQueen
 * 
 * [Function]
 *  Implements core objects and logic for NQueen
 * 
 * [Limitation]
 *  - Supported board size
 *   This module supports board size from 4 to 12.
 * 
 * [History]
 *  2019.4.13 higmsys - create a new entry
 * ************************************************************** */


var nq = nq || {};

nq.core = {};

/**
 * Board size information.
 */
nq.core.BoardSize = {
    /**
     * Mininum size
     */
    MIN: 4,
    /**
     * Maximum size
     */
    MAX: 12,
    /**
     * Default size
     */
    DEFAULT: 8,
};

/**
 * State of square.
 * @enum {number}
 */
nq.core.SquareState = {
    NORMAL: 1,
    QUEEN: 2,
    SUCCESS: 4,
    FAILED: 8,
};

/**
 * @classdesc The class indicates a location on X-axis and Y-axis.
 */
nq.core.Point = (function() {
    /**
     * Create a instance with specified values on X-axis and Y-axis.
     * @constructor
     * @param {number} iX a location on X-axis
     * @param {number} iY a location on Y-axis
     */
    var Point = function(iX, iY) {
        this.m_iX = iX;
        this.m_iY = iY;
    };

    /**
     * Returns a location on X-axis.
     * @return {number} a location on X-axis
     */
    Point.prototype.getX = function() { return this.m_iX; }
    /**
     * Returns a location on Y-axis.
     * @return {number} a location on Y-axis
     */
    Point.prototype.getY = function() { return this.m_iY; }

    return Point;
})();

/**
 * @classdesc The class indicates move amount for a direction.
 */
nq.core.Direction = (function() {
    /**
     * Create a instance with the specified move amount.
     * @constructor
     * @param {number} iMoveAmountX move amount for X-axis
     * @param {number} iMoveAmountY move amount for Y-axis
     */
    var Direction = function(iMoveAmountX, iMoveAmountY) {
        this.m_iMoveAmountX = iMoveAmountX;
        this.m_iMoveAmountY = iMoveAmountY;
    }

    /**
     * Returns a move amount for X-axis.
     * @returns {number} amount for X-axis
     */
    Direction.prototype.getMoveAmountX = function() { return this.m_iMoveAmountX; }

    /**
     * Returns a move amount for Y-axis.
     * @returns {number} amount for Y-axis
     */
    Direction.prototype.getMoveAmountY = function() { return this.m_iMoveAmountY; }

    return Direction;
})();
/**
 * @classdesc The class indicates a square on board.
 */
nq.core.Square = (function() {
    /**
     * Create a instance with specified values on X-axis and Y-axis.
     * @constructor
     * @param {number} iX a location on X-axis
     * @param {number} iY a location on Y-axis
     */
    var Square = function(iX, iY) {
        this.m_iX = iX;
        this.m_iY = iY;
        this.m_state = nq.core.SquareState.NORMAL;
        this.m_iQueenTerritoryCount = 0;
    }

    /**
     * Returns a location on X-axis.
     * @return {number} a location on X-axis
     */
    Square.prototype.getX = function() { return this.m_iX; }

    /**
     * Returns a location on Y-axis.
     * @return {number} a location on Y-axis
     */
    Square.prototype.getY = function() { return this.m_iY; }

    /**
     * Set a state of this square.
     * @param {nq.core.SquareState} state new state
     */
    Square.prototype.setState = function(state) { this.m_state = state; }

    /**
     * Returns a state of this square.
     * @return {nq.core.SquareState} state
     */
    Square.prototype.getState = function() { return this.m_state; }

    /**
     * Returns true when a state is SquareState#normal.
     * @returns true when normal state
     */
    Square.prototype.isNormalState = function() { return this.m_state == nq.core.SquareState.NORMAL; }

    /**
     * Returns true when a queen is on this square.
     * @return true when a queen is on this square
     */
    Square.prototype.isOnQueen = function() { return this.m_state == nq.core.SquareState.QUEEN; }

    /**
     * Add a count of queens of which this square is located on a route.
     * Specify a negative value, when reducing the count.
     * @param {number} iCountAdd a count of queens
     */
    Square.prototype.addQueenTerritoryCount = function(iCountAdd) { this.m_iQueenTerritoryCount += iCountAdd; }

    /**
     * Returns a count of queens of which this square is located on a route.
     * @returns {number} a count of queens
     */
    Square.prototype.getQueenTerritoryCount = function() { return this.m_iQueenTerritoryCount; }

    /**
     * Returns true when there are one or more queens of which this square is located on a route.
     * @returns true when this square is on a route of any queens
     */
    Square.prototype.isOnQueenTerritory = function() {
        return (0 < this.m_iQueenTerritoryCount);
    };

    return Square;
})();


/**
 * @classdesc The class indicates result of WorkBoard#executeStep()
 */
nq.core.StepResult = (function() {
    /**
     * Create a instance.
     * @constructor
     * @param {boolean} isExecuted it's executed or not
     * @param {boolean} isSolved it's solved or not
     */
    var MoveResult = function(isExecuted, isSolved) {
        this.m_isExecuted = isExecuted;
        this.m_isSolved = isSolved;
    };

    /**
     * Returns true when it's excuted.
     * @returns {boolean} it's excuted or not
     */
    MoveResult.prototype.isExecuted = function() { return this.m_isExecuted; };

    /**
     * Returns true when it's solved.
     * @returns {boolean} it's solved or not
     */
    MoveResult.prototype.isSolved = function() { return this.m_isSolved; };

    return MoveResult;
})();


/**
 * @classdesc The class provides operations for solving N Queen puzle.
 */
nq.core.WorkBoard = (function() {
    /**
     * Create a instance with the specified board size.
     * @constructor
     * @param {number} iBoardSize board size
     * @param {boolean} isExcludeSymmetry exclude symmetry result or not
     */
    var WorkBoard = function(iBoardSize, isExcludeSymmetry) {
        this.m_iBoardSize = iBoardSize;
        this.m_isExcludeSymmetry = isExcludeSymmetry;
        this.m_squares = [];
        (function(squares, iSize) {
            for(var iX = 0; iX < iSize; iX++) {
                squares[iX] = [];
                for(var iY = 0; iY < iSize; iY++) {
                    squares[iX][iY] = new nq.core.Square(iX, iY);
                }
            }
        })(this.m_squares, this.m_iBoardSize);
        this.m_pointsTrack = [];
        this.m_pointsTrack.push(new nq.core.Point(0, 0));
        this.m_resultIds = [];
    };

    /**
     * Returns true when the specified location is on board.
     * @param {number} iBoardSize board size
     * @param {number} iX a location on X-axis
     * @param {number} iY a location on Y-axis
     * @returns {boolean} the location is on board or not
     */
    var isOnBoard = function(iBoardSize, iX, iY) {
        return (0 <= iX && iX < iBoardSize) && (0 <= iY && iY < iBoardSize);
    }

    /**
     * Returns points that a queen of the specified location is movable.
     * @param {number} iBoardSize board size
     * @param {nq.core.Point} queenPoint queen location
     * @returns {Array<nq.core.Point>} movable points
     */
    var getQueenTerritoryPoints = function(iBoardSize, queenPoint) {
        var territoryPoints = [];

        var directions = [
            new nq.core.Direction(-1, -1),  // left up
            new nq.core.Direction( 0, -1),  // up
            new nq.core.Direction( 1, -1),  // right up

            new nq.core.Direction(-1,  0),  // left
            new nq.core.Direction( 1,  0),  // right

            new nq.core.Direction(-1,  1),  // left down
            new nq.core.Direction( 0,  1),  // down
            new nq.core.Direction( 1,  1),  // right down
        ];

        for(var iLpDir = 0; iLpDir < directions.length; iLpDir++) {
            let dir = directions[iLpDir];
            for(var iLpSq = 1; iLpSq < iBoardSize; iLpSq++) {
                let iX = queenPoint.getX() + (dir.getMoveAmountX() * iLpSq);
                let iY = queenPoint.getY() + (dir.getMoveAmountY() * iLpSq);

                if(isOnBoard(iBoardSize, iX, iY)) {
                    territoryPoints.push(new nq.core.Point(iX, iY));
                } else {
                    break;
                }
            }
        }

        return territoryPoints;
    };

    /**
     * Add the specified amount to count of queens territory on squares of the specified points.
     * @param {Array<Array<nq.core.Square>>} squares all squares
     * @param {Array<nq.core.Point>} points points to add
     * @param {number} iAddAmount amount to add
     */
    var addQueenTerritoryCount = function(squares, points, iAddAmount) {
        for(var i = 0; i < points.length; i++) {
            let iX = points[i].getX();
            let iY = points[i].getY();
            squares[iX][iY].addQueenTerritoryCount(iAddAmount);
        }
    }

    /**
     * Returns an unique identifier as queens arrangement on board.
     * 
     * @param {Array<Array<nq.core.Square>>} squares all squares
     * @param {number} iBoardSize board size
     * @param {number} iStartX base location on X-axis
     * @param {number} iStartY base location on Y-axis
     * @param {nq.core.Direction} direction1st direction 1 of the board(squares)
     * @param {nq.core.Direction} direction2nd direction 2 of the board(squares)
     * @returns {number} unique identifier
     */
    var getArrangedQueenUid = function(squares, iBoardSize, iStartX, iStartY, direction1st, direction2nd) {
        var iId = 0;

        // Unique identifier is generated in the procedure below.
        //  - Apply unique number to all squares
        //                towards the specified directions
        //                from specified location.
        //  - Adding the unique number of locations in which queens is arranged.
        //
        // ex)
        //  board (size: 4)
        //   - - Q -
        //   Q - - -
        //   - - - Q
        //   - Q - -
        //
        //  getArrangedQueenUid(squares, 4, 0, 0, new nq.core.Directions(1, 0), new nq.core.Direction(0, 1))
        //
        //      1  |     2  | [   3] |     4
        //  -------+--------+--------+-------
        //  [  16] |    32  |    48  |    64
        //  -------+--------+--------+-------
        //    128  |   256  |   384  | [ 512]
        //  -------+--------+--------+-------
        //   1024  | [2048] |  3072  |  4096
        // 
        //   -> (3 + 16 + 512 + 2048) = 2579
        // 
        //  getArrangedQueenUid(squares, 4, 3, 0, new nq.core.Directions(-1, 0), new nq.core.Direction(0, 1))
        //
        //      4  |     3  | [   2] |     1
        //  -------+--------+--------+-------
        //  [  64] |    48  |    32  |    16
        //  -------+--------+--------+-------
        //    512  |   384  |   256  | [ 128]
        //  -------+--------+--------+-------
        //   4096  | [3072] |  2048  |  1024
        // 
        //   -> (2 + 64 + 128 + 3072) = 3266
        // 

        for(var iLp2nd = 0; iLp2nd < iBoardSize; iLp2nd++) {
        for(var iLp1st = 0; iLp1st < iBoardSize; iLp1st++) {
            let iX = iStartX
                    + (direction1st.getMoveAmountX() * iLp1st)
                    + (direction2nd.getMoveAmountX() * iLp2nd);
            let iY = iStartY
                    + (direction1st.getMoveAmountY() * iLp1st)
                    + (direction2nd.getMoveAmountY() * iLp2nd);
            if(squares[iX][iY].isOnQueen()) {
                iId |= ((iLp1st + 1) << (iLp2nd * 4))
            }
        }
        }

        return iId;
    }

    /**
     * Returns a group identifier as queen arrangement on board.
     * This returns same number for symmetrical arrangements.
     * @param {Array<Array<nq.core.Square>>} squares all squares
     * @param {number} iBoardSize board size
     * @returns {number} group identifier
     */
    var getArrangedQueenGid = function(squares, iBoardSize) {
        var iId = 0;

        var dirRight = new nq.core.Direction(1, 0);
        var dirLeft = new nq.core.Direction(-1, 0);
        var dirUp = new nq.core.Direction(0, -1);
        var dirDown = new nq.core.Direction(0, 1);

        var getUid = getArrangedQueenUid;

        var uids = [
            getUid(squares, iBoardSize,              0, 0, dirRight, dirDown),
            getUid(squares, iBoardSize,              0, 0, dirDown,  dirRight),
            getUid(squares, iBoardSize, iBoardSize - 1, 0, dirLeft,  dirDown),
            getUid(squares, iBoardSize, iBoardSize - 1, 0, dirDown,  dirLeft),
            getUid(squares, iBoardSize,              0, iBoardSize - 1, dirRight, dirUp),
            getUid(squares, iBoardSize,              0, iBoardSize - 1, dirUp,  dirRight),
            getUid(squares, iBoardSize, iBoardSize - 1, iBoardSize - 1, dirLeft,  dirUp),
            getUid(squares, iBoardSize, iBoardSize - 1, iBoardSize - 1, dirUp,  dirLeft),
        ];

        iId = Math.min.apply(null, uids);

        return iId;
    }

    /**
     * Clear all square state of the specified row.
     * @param {Array<Array<nq.core.Square>>} squares all squares
     * @param {number} iBoardSize board size
     * @param {number} iY a location on Y-axis
     */
    var clearRowState = function(squares, iBoardSize, iY) {
        for(var iLpX = 0; iLpX < iBoardSize; iLpX++) {
            squares[iLpX][iY].setState(nq.core.SquareState.NORMAL);
        }
    }

    /**
     * Back cursor to previous row and set state.
     * @param {Array<Array<nq.core.Square>>} squares all squares
     * @param {Array<nq.core.Point>} pointsTrack track of cursor points
     * @param {number} iBoardSize board size
     */
    var backPreviousRow = function(squares, pointsTrack, iBoardSize) {
        var currentPoint = pointsTrack[pointsTrack.length - 1];
        var prevRowPoint = pointsTrack[pointsTrack.length - 2];
        var currentSquare = squares[currentPoint.getX()][currentPoint.getY()];
        var resultState;

        if(currentSquare.isOnQueen()) {
            let territoryPoints = getQueenTerritoryPoints(iBoardSize, currentPoint);
            addQueenTerritoryCount(squares, territoryPoints, -1);            
            resultState = nq.core.SquareState.SUCCESS;
        } else {
            resultState = nq.core.SquareState.FAILED;
            for(var iX = 0; iX < iBoardSize; iX++) {
                if(squares[iX][currentPoint.getY()].getState() == nq.core.SquareState.SUCCESS) {
                    resultState = nq.core.SquareState.SUCCESS;
                    break;
                }
            }
        }

        clearRowState(squares, iBoardSize, currentPoint.getY());
        pointsTrack.pop();
        squares[prevRowPoint.getX()][prevRowPoint.getY()].setState(resultState);

        var territoryPointsPrevRow = getQueenTerritoryPoints(iBoardSize, prevRowPoint);
        addQueenTerritoryCount(squares, territoryPointsPrevRow, -1);
    };

    /**
     * Returns board size
     * @returns {number} board size
     */
    WorkBoard.prototype.getBoardSize = function() { return this.m_iBoardSize; }

    /**
     * Returns true when exclude symmetry result.
     * @returns {boolean} true when exclude symmetry result
     */
    WorkBoard.prototype.isExcludeSymmetry = function() { return this.m_isExcludeSymmetry; }

    /**
     * Returns a square of the specified location.
     * @param {number} iX a location on X-axis
     * @param {number} iY a location on Y-axis
     * @returns {nq.core.Square} square
     */
    WorkBoard.prototype.getSquareStateAt = function(iX, iY) { return this.m_squares[iX][iY].getState(); }

    /**
     * Returns a square.
     * @param {number} iX
     * @param {number} iY
     * @returns {nq.core.Square}
     */
    WorkBoard.prototype.getSquare = function(iX, iY) { return this.m_squares[iX][iY]; }

    /**
     * Returns a result count.
     * @returns {number} result count
     */
    WorkBoard.prototype.getResultCount = function() { return this.m_resultIds.length; }

    /**
     * Returns a point located cursor.
     * @returns {nq.core.Point} point
     */
    WorkBoard.prototype.getCurrentPoint = function() { return this.m_pointsTrack[this.m_pointsTrack.length - 1]; }

    /**
     * execute a step for solving.
     * @returns {nq.core.MoveResult} result
     */
    WorkBoard.prototype.executeStep = function() {
        var currentPoint = this.getCurrentPoint();
        var iCurrentX = currentPoint.getX();
        var iCurrentY = currentPoint.getY();
        var currentSquare = this.m_squares[iCurrentX][iCurrentY];

        var isExecuted = true;
        var isSolved = false;

        if(currentSquare.isNormalState()) {
            if(currentSquare.isOnQueenTerritory()) {
                // failed
                currentSquare.setState(nq.core.SquareState.FAILED);
            } else {
                // set queen
                currentSquare.setState(nq.core.SquareState.QUEEN);
                let territoryPoints = getQueenTerritoryPoints(this.m_iBoardSize, currentPoint);
                addQueenTerritoryCount(this.m_squares, territoryPoints, 1);

                // confirm that queens is set for all rows or not
                if(this.m_iBoardSize <= (iCurrentY + 1)) {
                    if(this.m_isExcludeSymmetry) {
                        let gid = getArrangedQueenGid(this.m_squares, this.m_iBoardSize);
                        isSolved = (this.m_resultIds.indexOf(gid) < 0);
                        if(isSolved) {
                            this.m_resultIds.push(gid);
                        }
                    } else {
                        let uid = getArrangedQueenUid(
                            this.m_squares,
                            this.m_iBoardSize,
                            0,
                            0,
                            new nq.core.Direction(1, 0),
                            new nq.core.Direction(0, 1));
                        this.m_resultIds.push(uid);
                        isSolved = true;
                    }
                }
            }
        } else if(currentSquare.isOnQueen()) {
            if((iCurrentY + 1) < this.m_iBoardSize) {
                // move next row
                this.m_pointsTrack.push(new nq.core.Point(0, iCurrentY + 1));
            } else {
                // back previous row
                backPreviousRow(this.m_squares, this.m_pointsTrack, this.m_iBoardSize);
            }
        } else {
            // success or failed is already set for current square
            // so move cursor to next square

            if((iCurrentX + 1) < this.m_iBoardSize) {
                // move right
                this.m_pointsTrack.pop();
                this.m_pointsTrack.push(new nq.core.Point(iCurrentX + 1, iCurrentY));
            } else if(0 < iCurrentY) {
                // back previous row
                backPreviousRow(this.m_squares, this.m_pointsTrack, this.m_iBoardSize);
            } else {
                // do nothing since this puzzle is finished.
                isExecuted = false;
            }
        }

        return new nq.core.StepResult(isExecuted, isSolved);
    };

    return WorkBoard;
})();

