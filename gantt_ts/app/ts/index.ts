
import input from './data/model';
import { Map } from 'd3';
import { Task } from './task/task';
import { GanttChart } from './lib/ganttChart'

function show() {
  'use strict';

  let taskStatus: string[] = [];
  const NUMOFCOLORS: number = 32;
  let tasks: Task[] = [];

  let signalMap = new Map<string, string>();
  let signalValueMap = new Map<string, string>();
  var colorMap = new Map<string, string>();
  var timeMap = new Map<string, number>();


  // const colorPalette = palette('tol-rainbow', NUMOFCOLORS).reverse();
  const colorPalette: string[] = ["d92120", "de3624", "e34c28", "e5622c", "e7762f", "e78833", "e49736", "e0a339", "d9ad3c", "d1b440", "c7b944", "bcbc49", "b0be4e", "a3be55", "96bd5e", "8abb68", "7db973", "72b581", "68b090", "5eaaa0", "56a2b0", "4f99bb", "498dc1", "4580c1", "4170b9", "3f60ae", "3f4ea0", "413c93", "452b89", "4e1e81", "5d187e", "781c81"];

  let resultTrace = input["slxrt:ResultsTrace"];

  if (typeof (resultTrace.EnumSignal.length) != "undefined") {
    resultTrace.EnumSignal.forEach(function (signal) {
      signalMap.set(signal.id, signal.name);
    }, this);
  }

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




  function getColor(colorID: number): string {
    // let iCol = parseInt(colorID)
    if (colorID != 0) {
      if (colorID > NUMOFCOLORS) {
        colorID = Math.ceil(colorID / NUMOFCOLORS);
      }
      return colorPalette[colorID];
    }
    return "ff0000";
  }

  let cTime: number = 0;
  resultTrace.t.forEach(function (time) {
    const nTime: number = time.ps;
    if (time.e instanceof Array) {
      time.e.forEach(function (tEvent) {
        readEvent(nTime, tEvent);
      }, this);
    } else {
      readEvent(nTime, time.e);
      // console.log("Evnt:=" + time.e);
    }
  }, this);


  function readEvent(nTime: number, tEvent: any) {
    if (tEvent) {
      if (timeMap.get(tEvent.s) != null) {
        cTime = timeMap.get(tEvent.s);
      }

      var status: string = signalValueMap.get(tEvent.v);
      var tName: string = signalMap.get(tEvent.s);
      tasks.push(new Task(tName, status, cTime, nTime, colorMap.get(status)));
      timeMap.set(tEvent.s, nTime);
    }
  }


  //create class and initiate Gantt 

  let gc: GanttChart = new GanttChart();
  gc.createGanntChart();

}

window.onload = show;


