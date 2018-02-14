var tasks = [
    // { "startDate": 10, "endDate": 1000, "taskName": "ARM00", "status": "idle", "color": "red", "duration": 900 },
    // { "startDate": 10, "endDate": 1000, "taskName": "ARM01", "status": "print", "color": "blue", "duration": 900 },
    // { "startDate": 1000, "endDate": 3400, "taskName": "ARM02", "status": "context load", "color": "orange", "duration": 2400 },
    // { "startDate": 3400, "endDate": 5000, "taskName": "ARM03", "status": "add", "color": "green", "duration": 1600 },
];

var taskStatus = [];
var NUMOFCOLORS = 16;
var taskNames = [];

loadInputModel(ganttInput);
var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus);
gantt(tasks);

function loadInputModel(input) {

    var resultTrace = input["slxrt:ResultsTrace"];
    var signalMap = new Map;
    var signalValueMap = new Map;
    var colorMap = new Map;
    var timeMap = new Map;

    if (typeof (resultTrace.EnumSignal.length) != "undefined") {
        resultTrace.EnumSignal.forEach(function (signal) {
            signalMap.set(signal.id, signal.name);
            taskNames.push(signal.name);
        }, this);
    }

    if (resultTrace.EnumValue > NUMOFCOLORS) {
        NUMOFCOLORS = resultTrace.EnumValue;
    }


    var colorPalette = palette('tol-rainbow', NUMOFCOLORS).reverse();
    resultTrace.EnumValue.forEach(
        function (eValue) {
            var vName = eValue.name;
            taskStatus.push(vName);
            signalValueMap.set(eValue.id, vName);
            if (eValue.Option) {
                const key = eValue.Option.key;
                if (key == 'colorId') {
                    const color = colorMap.get(vName);
                    if (color == null) {
                        colorMap.set(vName, '#' + getColor(eValue.Option.val));
                    }
                }
            }
        }, this);

    var cTime = 0;
    resultTrace.t.forEach(function (time) {
        var nTime = parseInt(time.ps);
        if (time.e instanceof Array) {
            time.e.forEach(function (tEvent) {
                readEvent(nTime, tEvent);
            }, this);
        } else {
            readEvent(nTime, time.e);
            // console.log("Evnt:=" + time.e);
        }
    }, this);

    function getColor(colorID) {
        var iCol = parseInt(colorID)
        if (colorID.length != 0) {
            // console.log(colorID);
            if (iCol > NUMOFCOLORS) {
                colorID = Math.ceil(iCol / NUMOFCOLORS);
                // console.log("New value=" + colorID);
            }
            return colorPalette[colorID];
        }
        return "ff0000";
    }

    function readEvent(nTime, tEvent) {
        if (tEvent) {
            if (timeMap.get(tEvent.s) != null) {
                cTime = timeMap.get(tEvent.s);
            }

            var status = signalValueMap.get(tEvent.v);
            var tName = signalMap.get(tEvent.s);
            tasks.push({
                "id": tName + cTime + status,
                "taskName": tName,
                "status": status,
                "startDate": cTime,
                "endDate": nTime,
                "duration": nTime - cTime,
                "color": colorMap.get(status),
            });
            timeMap.set(tEvent.s, nTime);
        }
    }

}