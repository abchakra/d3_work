
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
      // console.log(colorID);
      if (colorID > NUMOFCOLORS) {
        colorID = Math.ceil(colorID / NUMOFCOLORS);
        // console.log("New value=" + colorID);
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


  let gc: GanttChart = new GanttChart();
  gc.createGanntChart();
  console.log(tasks);
}








// class SymbolWrapper {
//   constructor(public name: string, public symbol: SymbolType) {
//   }
// }


// function show(ev: Event) {

//   'use strict';
//   // Generic setup
//   const margin = {top: 20, bottom: 20, right: 20, left: 30};
//   const width = 600 - margin.left - margin.right;
//   const height = 200 - margin.top - margin.bottom;

//   // create the standard chart
//   let svg = d3.select(".chart")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//   let symbols = [
//     new SymbolWrapper('Cross', d3.symbolCross),
//     new SymbolWrapper('Circle', d3.symbolCircle),
//     new SymbolWrapper('Diamond', d3.symbolDiamond),
//     new SymbolWrapper('Square', d3.symbolSquare),
//     new SymbolWrapper('Star', d3.symbolStar),
//     new SymbolWrapper('Triangle', d3.symbolTriangle),
//     new SymbolWrapper('Wye', d3.symbolWye)
//   ];

//   let color = d3.scaleOrdinal()
//     .domain(symbols.map(s => s.name))
//     .range(d3.schemeCategory10);

//   let xBand = d3.scaleBand()
//     .domain(symbols.map(s => s.name))
//     .range([0, width])
//     .paddingInner(0.1);

//   let symbolGroups = svg.selectAll(".symbol").data(symbols)
//     .enter()
//     .append("g")
//     .attr("class", d => "symbol")
//     .attr("transform", d => `translate(${xBand(d.name)} 40)`)

//   symbolGroups
//     .append("path")
//     .attr("fill", d => <string>color(d.name))
//     .attr("d", d => d3.symbol().size(2400).type(d.symbol)());
// }

window.onload = show;


