/* *****************************************************************
 * [Project]
 *  NQueen
 * 
 * [Function]
 *  Implements objects/functions for view
 * 
 * [Limitation]
 * 
 * [History]
 *  2019.4.13 higmsys - create a new entry
 * ************************************************************** */


var nq = nq || {};

nq.view = {};

/**
 * @classdesc The class provides methods for operating DOM elemnets.
 */
nq.view.DomUtil = (function() {
    /**
     * Remove child elements from the specified element.
     * @param {Element} domRoot root element
     */
    var clearChildren = function(domRoot) {
        while(domRoot.firstChild) {
            clearChildren(domRoot.firstChild);
            domRoot.removeChild(domRoot.firstChild);
        }
    };

    /**
     * Returns class name which is set the specified element.
     * @param {Element} dom element
     * @returns {string} class name
     */
    var getClassName = function(dom) {
        return dom.getAttribute('class');
    }

    /**
     * Set a class name to the specified element.
     * @param {Element} dom element
     * @param {string} sClassName class name
     */
    var setClassName = function(dom, sClassName) {
        dom.setAttribute('class', sClassName);
    }

    /**
     * Add a class name to the specified element.
     * @param {Element} dom element
     * @param {string} sClassName class name
     */
    var addClassName = function(dom, sClassName) {
        var sBefore = getClassName(dom);
        var sAfter = (sBefore) ? (sBefore + ' ' + sClassName) : sClassName;

        setClassName(dom, sAfter);
    }

    /**
     * Remove a class name from the specified element.
     * @param {Element} dom element
     * @param {string} sClassName class name
     */
    var removeClassName = function(dom, sClassName) {
        var sBefore = getClassName(dom);
        var classesBefore = sBefore.split(' ');
        var classesAfter = [];

        for(var i = 0; i < classesBefore.length; i++) {
            let s = classesBefore[i];
            if(s != sClassName) {
                classesAfter.push(s);
            }
        }

        var sAfter = classesAfter.join(' ');
        setClassName(dom, sAfter);
    }

    /**
     * Add a text node to the specified element.
     * @param {Element} dom element
     * @param {string} sText text
     */
    var addText = function(dom, sText) {
        var domText = document.createTextNode(sText);
        dom.appendChild(domText);
    }

    return {
        clearChildren: clearChildren,
        getClassName: getClassName,
        setClassName: setClassName,
        addClassName: addClassName,
        removeClassName: removeClassName,
        addText: addText,
    };
})();


/**
 * @classdesc The class provides text for board square.
 */
nq.view.SquareChar = (function() {
    var texts = [];
    texts[nq.core.SquareState.NORMAL] = '';
    texts[nq.core.SquareState.SUCCESS] = 'o';
    texts[nq.core.SquareState.FAILED] = 'x';
    texts[nq.core.SquareState.QUEEN] = 'Q';

    /**
     * Returns text for specified state.
     * @param {nq.core.SquareState} state square state
     * @returns {string} text
     */
    var getText = function(state) {
        return texts[state];
    };

    return {
        getText: getText,
    };
})();


/**
 * @classdesc The class which laps a DOM element due to arm operations for displaying board.
 */
nq.view.BoardPanel = (function() {
    /**
     * @constructor
     * @param {Element} domRoot DOM element for board
     */
    var BoardPanel = function(domRoot) {
        this.m_domRoot = domRoot;
    }

    var SQUARE_ID_NAME = 'data-squareid';

    /**
     * Returns a unique number created from the specified location.
     * @param {number} iX a location on X-axis
     * @param {number} iY a location on Y-axis
     */
    var getSquareId = function(iX, iY) {
        var iId = (iY * nq.core.BoardSize.MAX) + iX;
        return iId;
    }

    /**
     * Initialize board.
     * @param {nq.core.WorkBoard} workBoard WorkBoard object
     */
    BoardPanel.prototype.initialize = function(workBoard) {
        var iBoardSize = workBoard.getBoardSize();
        var domFrag = document.createDocumentFragment();

        nq.view.DomUtil.clearChildren(this.m_domRoot);

        for(var iY = 0; iY < iBoardSize; iY++) {
            let domLine = document.createElement('div');

            for(var iX = 0; iX < iBoardSize; iX++) {
                let domSquare = document.createElement('div');
                let iSquareId = getSquareId(iX, iY);

                nq.view.DomUtil.setClassName(domSquare, 'cell');
                domSquare.setAttribute(SQUARE_ID_NAME, '' + iSquareId);

                domLine.appendChild(domSquare);
            }

            domFrag.appendChild(domLine);
        }

        this.m_domRoot.appendChild(domFrag);

        this.update(workBoard);
    }

    /**
     * Update view data.
     * @param {nq.core.WorkBoard} workBoard data for displaying
     */
    BoardPanel.prototype.update = function(workBoard) {
        var iBoardSize = workBoard.getBoardSize();
        var squareDoms = this.m_domRoot.getElementsByClassName('cell');
        var currentPoint = workBoard.getCurrentPoint();
        var iCurrentX = currentPoint.getX();
        var iCurrentY = currentPoint.getY();
        var isQueenOnCursor = (workBoard.getSquareStateAt(iCurrentX, iCurrentY) == nq.core.SquareState.QUEEN);

        var getSquareDom = function(squareDoms, iX, iY) {
            var sSquareId = '' + getSquareId(iX, iY);
            var domSquare = null;
            for(var i = 0; i < squareDoms.length; i++) {
                let s = squareDoms[i].getAttribute(SQUARE_ID_NAME);
                if(s == sSquareId) {
                    domSquare = squareDoms[i];
                    break;
                }
            }
            return domSquare;
        }

        for(var iY = 0; iY < iBoardSize; iY++) {
        for(var iX = 0; iX < iBoardSize; iX++) {
            let domSquare = getSquareDom(squareDoms, iX, iY);
            let state = workBoard.getSquareStateAt(iX, iY);
            let isOnQueen = (state == nq.core.SquareState.QUEEN);
            let isOnQueenTerritory = false;

            if(isQueenOnCursor) {
                isOnQueenTerritory |= (iX == iCurrentX);
                isOnQueenTerritory |= (iY == iCurrentY);
                isOnQueenTerritory |= (iCurrentX - (iCurrentY - iY) == iX);
                isOnQueenTerritory |= (iCurrentX + (iCurrentY - iY) == iX);
                isOnQueenTerritory |= (iCurrentX - (iY - iCurrentY) == iX);
                isOnQueenTerritory |= (iCurrentX + (iY - iCurrentY) == iX);
            }

            // set text
            nq.view.DomUtil.clearChildren(domSquare);
            nq.view.DomUtil.addText(domSquare, nq.view.SquareChar.getText(state));

            // set class
            nq.view.DomUtil.setClassName(domSquare, 'cell');
            if(iX == iCurrentX && iY == iCurrentY) {
                nq.view.DomUtil.addClassName(domSquare, 'cell-cursor');
            }
            if(isOnQueen) {
                nq.view.DomUtil.addClassName(domSquare, 'cell-queen');
            } else if(isOnQueenTerritory) {
                nq.view.DomUtil.addClassName(domSquare, 'cell-territory-emphasis');
            } else if(0 < workBoard.getSquare(iX, iY).getQueenTerritoryCount()) {
                nq.view.DomUtil.addClassName(domSquare, 'cell-territory');
            }
        }
        }
    }


    return BoardPanel;
})();


/**
 * @classdesc The class which laps a DOM element due to arm operations for displaying results.
 */
nq.view.ResultPanel = (function() {
    /**
     * 
     * @param {Element} dom 
     */
    var ResultPanel = function(dom) {
        this.m_domRoot = dom;
    }

    /**
     * 
     * @param {nq.core.WorkBoard} workBoard
     */
    ResultPanel.prototype.addResult = function(workBoard) {
        var iCount = workBoard.getResultCount();
        var iBoardSize = workBoard.getBoardSize();

        var domResult = document.createElement('div');
        var domCount = document.createElement('div');
        var classNames = ['cell', 'cell-small'];

        nq.view.DomUtil.addText(domCount, '<' + iCount + '>');
        domResult.appendChild(domCount);

        for(var iY = 0; iY < iBoardSize; iY++) {
            let domLine = document.createElement('div');

            for(var iX = 0; iX < iBoardSize; iX++) {
                let domCell = document.createElement('span');
                nq.view.DomUtil.setClassName(domCell, classNames.join(' '));

                if(workBoard.getSquare(iX, iY).isOnQueen()) {
                    nq.view.DomUtil.addText(domCell, nq.view.SquareChar.getText(nq.core.SquareState.QUEEN));
                    nq.view.DomUtil.addClassName(domCell, 'cell-queen');
                }

                domLine.appendChild(domCell);
            }

            domResult.appendChild(domLine);
        }

        nq.view.DomUtil.setClassName(domResult, 'result-board-area');

        this.m_domRoot.appendChild(domResult);
    }

    ResultPanel.prototype.clear = function() {
        nq.view.DomUtil.clearChildren(this.m_domRoot);
    };

    return ResultPanel;
})();


/**
 * @classdesc The class which laps a DOM element due to arm operations for displaying result count.
 */
nq.view.ResultCountPanel = (function() {
    /**
     * @constructor
     * @param {Element} dom 
     */
    var ResultCountPanel = function(dom) {
        this.m_domRoot = dom;
    };

    /**
     * Set a count.
     * @param {number} iCount
     */
    ResultCountPanel.prototype.setCount = function(iCount) {
        nq.view.DomUtil.clearChildren(this.m_domRoot);
        nq.view.DomUtil.addText(this.m_domRoot, '' + iCount);
    }

    return ResultCountPanel;
})();
