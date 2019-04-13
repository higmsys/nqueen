/* *****************************************************************
 * [Project]
 *  NQueen
 * 
 * [Function]
 * 
 * [Limitation]
 * 
 * [History]
 *  2019.4.13 higmsys - create a new entry
 * ************************************************************** */


var nq = nq || {};

nq.Memory = {
    workBoard: null,
    boardPanel: null,
    resultPanel: null,
    domResultCount: null,
    iIntervalId: 0,
    iIntervalMs: 50,

    clear: function() {
        workBoard = null;
        boardPanel = null;
        resultPanel = null;
        domResultCount = null;
        iIntervalId = 0;
        iIntervalMs = 50;
    },
};

nq.Setup = (function() {

    var init = function(args) {
        var isExcludeSymmetry = (args.isExcludeSymmetry) ? args.isExcludeSymmetry : false;
        var iBoardSize = (args.iBoardSize || nq.core.BoardSize.DEFAULT);

        // initialize internal data
        nq.Memory.clear();
        nq.Memory.workBoard = new nq.core.WorkBoard(iBoardSize, isExcludeSymmetry);
        nq.Memory.boardPanel = new nq.view.BoardPanel(args.domBoard);
        nq.Memory.resultPanel = new nq.view.ResultPanel(args.domResult);
        nq.Memory.domResultCount = new nq.view.ResultCountPanel(args.domResultCount);
        nq.Memory.iIntervalMs = (args.rngInterval && args.rngInterval.value) || nq.Memory.iIntervalMs;

        nq.Memory.domResultCount.setCount(nq.Memory.workBoard.getResultCount());

        var runStep = function() {
            var res = nq.Memory.workBoard.executeStep();
            if(res.isExecuted()) {
                nq.Memory.boardPanel.update(nq.Memory.workBoard);
            } else {
                runStop();
            }

            if(res.isSolved()) {
                nq.Memory.resultPanel.addResult(nq.Memory.workBoard);
                nq.Memory.domResultCount.setCount(nq.Memory.workBoard.getResultCount());
            }
        };
        var runAuto = function() {
            runStop();
            nq.Memory.iIntervalId = setInterval(runStep, nq.Memory.iIntervalMs);
        };
        var runStop = function() {
            if(0 < nq.Memory.iIntervalId) {
                clearInterval(nq.Memory.iIntervalId);
                nq.Memory.iIntervalId = 0;
            }
        };
        var runAll = function() {
            for(;;) {
                var res = nq.Memory.workBoard.executeStep();
                if(res.isSolved()) {
                    nq.Memory.resultPanel.addResult(nq.Memory.workBoard);
                    nq.Memory.domResultCount.setCount(nq.Memory.workBoard.getResultCount());
                }
                if(!res.isExecuted()) { break; }
            }
            nq.Memory.boardPanel.update(nq.Memory.workBoard);
        };

        if(args.btnAll) {
            args.btnAll.addEventListener('click', runAll);
        }
        if(args.btnStep) {
            args.btnStep.addEventListener('click', runStep);
        }
        if(args.btnAuto) {
            args.btnAuto.addEventListener('click', runAuto);
        }
        if(args.btnStop) {
            args.btnStop.addEventListener('click', runStop);
        }
        if(args.rngInterval) {
            let listener = function() {
                nq.Memory.iIntervalMs = parseInt(this.value);
                if(0 < nq.Memory.iIntervalId) {
                    runStop();
                    runAuto();
                }
            };

            // Set the same listener to input event and change event
            //  since IE11 doesn't support input event.
            args.rngInterval.addEventListener('input', listener);
            args.rngInterval.addEventListener('change', listener);
        }

        nq.Memory.boardPanel.initialize(nq.Memory.workBoard);
    }

    var reset = function(iBoardSize, isExcludeSymmetry) {
        if(nq.Memory.iIntervalId) {
            clearInterval(nq.Memory.iIntervalId);
            nq.Memory.iIntervalId = 0;
        }
        nq.Memory.workBoard = new nq.core.WorkBoard(iBoardSize, isExcludeSymmetry);
        nq.Memory.boardPanel.initialize(nq.Memory.workBoard);
        nq.Memory.domResultCount.setCount(nq.Memory.workBoard.getResultCount());
        nq.Memory.resultPanel.clear();
    }

    return {
        init: init,
        reset: reset,
    }
})();
