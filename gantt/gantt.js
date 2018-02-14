/**
 * Base : https://github.com/dk8996/Gantt-Chart
 * Zoom Support : https://github.com/bertrandg/d3-gantt-scheduler
 */

d3.gantt = function () {
  var actualEnd;
  var timeDomainStart = 0;
  var timeDomainEnd = 10000;

  var taskTypes = [];
  var taskStatus = [];

  var WIDTH = 1400;
  var HEIGHT = 900;
  const BORDER = 100;
  const GAP = 60;
  const SLOTHEIGHT = 50;
  var startZoomK;

  var margin = {
    top: 20,
    right: BORDER,
    bottom: 20,
    left: BORDER
  };

  var diff = 100000;
  var miniHeight = 60;
  var x2, y2;

  var keyFunction = function (d) {
    if (d) {
      return d.startDate + d.taskName + d.endDate;
    } else {
      console.log(d);
    }
  };

  var rectTransform = function (d) {
    if (d)
      return "translate(" + scaleX(d.startDate) + "," + scaleY(d.taskName) + ")";
  };

  var scaleX, scaleY, axisX, axisY;
  var chart;
  var context;
  var brush;
  var zoom;

  var svg, elMain, elDragZone, elContainer, elAxisX, elAxisY, elDateStartAll, mini;
  var dateStartAll = 0;

  var initTimeDomain = function () {
    if (tasks === undefined || tasks.length < 1) {
      timeDomainStart = 0;
      timeDomainEnd = 1000;
      return;
    }

    timeDomainEnd = tasks[tasks.length - 1].endDate;
    timeDomainStart = tasks[0].startDate;
    actualEnd = timeDomainEnd;
    navStart = timeDomainStart;
    navEnd = timeDomainEnd;
    diff = actualEnd / 150;
  };

  function initAxis() {

    var elChart = d3.select('#chart').node();
    WIDTH = elChart.getBoundingClientRect().width;
    HEIGHT = elChart.getBoundingClientRect().height;
    miniHeight = taskNames.length * 12;

    // scaleX = d3.scaleTime().domain([timeDomainStart, timeDomainEnd]).range([0, WIDTH - BORDER * 2]).clamp(true);
    scaleX = d3.scaleLinear().domain([timeDomainStart, timeDomainEnd]).range([0, WIDTH - BORDER * 2]).clamp(true);

    scaleY = d3.scaleBand().domain(taskTypes).padding(.5).rangeRound([0, HEIGHT - (BORDER * 2) - miniHeight], .1);

    axisX = d3.axisBottom(scaleX).tickSizeInner(-HEIGHT + BORDER * 2).tickFormat(function (d) { return d + " PS"; })
      .tickSize(8).tickPadding(8);
    axisY = d3.axisLeft().scale(scaleY).tickSizeInner(-WIDTH + BORDER * 2);


    x2 = d3.scaleLinear().domain([0, actualEnd]).range([0, WIDTH - BORDER * 2]).clamp(true);
    y2 = d3.scaleBand().domain(taskTypes).range([0, miniHeight]);
  };


  //Create gantt chart 
  function gantt(tasks) {

    initTimeDomain();
    initAxis();

    createDOM();
    createGanttEvent();
    createBrushChart();
    return gantt;

  };


  function createDOM() {
    svg = d3.select("#chart")
      .append("svg")
      .attr('width', WIDTH)
      .attr('height', HEIGHT).call(tip);

    svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', WIDTH - BORDER * 2)
      .attr('height', HEIGHT - BORDER * 2)
      .style('fill', 'red');

    elMain = svg.append('g')
      .attr('class', 'main')
      .attr('transform', 'translate(' + BORDER + ',' + BORDER + ')')
      .call(d3.zoom()
        .on('zoom', scrollZoom))
      .on("dblclick.zoom", null);


    elAxisY = elMain.append('g')
      .attr('class', 'axis axis--y')
      .call(axisY);



    elAxisX = elMain.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0, " + (HEIGHT - (BORDER * 2) - miniHeight) + ")")
      .call(axisX);

    elDragZone = elMain.append('rect')
      .attr('class', 'drag-zone')
      .attr('width', WIDTH - 50 * 2)
      .attr('height', HEIGHT - BORDER * 2)
      .attr('clip-path', 'url(#clip)')
      .call(d3.drag()
        .on('drag', dragProgress));

    elContainer = elMain.append('g')
      .attr('class', 'container')
      .attr('clip-path', 'url(#clip)');

    elDateStartAll = elMain.append('line')
      .attr('class', 'dateStartAll')
      .attr('clip-path', 'url(#clip)')
      .attr('x1', scaleX(dateStartAll))
      .attr('y1', scaleY.range()[0])
      .attr('x2', scaleX(dateStartAll))
      .attr('y2', scaleY.range()[1]);

  }//END



  // create the browse area
  function createBrushChart() {

    mini = svg.append('g')
      .attr('class', 'mini')
      .attr('transform', 'translate(' + BORDER + ',' + (HEIGHT - BORDER) + ')')
      .attr('width', WIDTH)
      .attr('height', miniHeight);;

    // create and add y axis to the group
    mini.append('g')
      .attr('class', '_y_axis')
      .attr("transform", "translate(0, 0)")
      .call(d3.axisLeft().scale(y2).tickSizeInner(20));

    // create and add x axis to the group
    mini.append("g")
      .attr("class", "_x_axis")
      .attr("transform", "translate(0, " + (miniHeight) + ")")
      .call(d3.axisBottom(x2).tickFormat(function (d) {
        if (d) {
          return d;
        }
      }));


    const updateSlots = mini.selectAll('.minislot').data(tasks, d => d.id);
    const exitSlots = updateSlots.exit();
    const enterSlots = updateSlots.enter();
    exitSlots.remove();
    exitSlots.transition().duration(500).attr('opacity', 0);

    const miniSlotHeight = miniHeight / taskNames.length;
    const entry = enterSlots.append('g')
      .attr('class', 'mini_slot')
      .attr('transform', function (d) {
        return "translate(" + x2(d.startDate) + "," + y2(d.taskName) + ")";
      });


    entry.append('rect')
      .attr('class', 'mini_zone')
      .attr('x', 0)
      .attr('y', - miniSlotHeight / 4)
      .attr('width', d => x2(getEnd(d)) - x2(getStart(d)))
      .attr('height', miniSlotHeight)
      .style('fill', d => d.color);

    // draw the selection area
    brush = d3.brushX()
      .extent([[0, 0], [WIDTH - BORDER * 2, miniHeight]])
      // .on("end", moveBrush)
      // .on("start brush", brushed)
      .on("end", brushended);

    var gBrush = mini.append('g')
      .attr('class', 'brush')
      .call(brush);
  }

  function brushended() {
    if (!d3.event.sourceEvent) return; // Only transition after input.
    if (!d3.event.selection) return; // Ignore empty selections.
    const domain = d3.event.selection.map(x2.invert, x2);

    const start = Math.floor(domain[0]);
    const end = Math.ceil(domain[1]);
    // console.log("Start=" + start + "|" + "End=" + end);
    if (end > start) {
      updateAxisX(start, end, 0);
    }
  }


  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function (d) {
      var start = d.startDate;
      var end = d.endDate;
      var stat = d.status;
      var tName = d.taskName;
      if (d.last) {
        return stat + " <br/> " + start.toUTCString() + " to now";
      }
      return "Task :" + tName + " <br/> " + "Status :" + stat + " <br/> " + "<br/> Duration:" + start + " to " + end;
    });


  function getSlotHeight() {
    const l = taskNames.length;

    return Math.ceil((HEIGHT - 2 * BORDER) / l) - (l > 10 ? 0 : SLOTHEIGHT);
  }

  function createGanttEvent() {
    const updateSlots = elContainer.selectAll('.slot').data(tasks, d => d.id);
    const exitSlots = updateSlots.exit();
    const enterSlots = updateSlots.enter();


    exitSlots.remove();
    exitSlots.transition().duration(500).attr('opacity', 0);
    const slotHeight = getSlotHeight();

    const entry = enterSlots.append('g')
      .attr('class', 'slot')
      .attr('uniqid', d => 'id' + d.id)
      .attr('status', d => d.status)
      .attr('transform', rectTransform);


    entry.append('rect')
      .attr('class', 'zone')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('x', 0)
      .attr('y', - slotHeight / 4)
      .attr('width', d => scaleX(getEnd(d)) - scaleX(getStart(d)))
      .attr('height', slotHeight)
      // .attr('cursor', 'move')
      .style('fill', d => d.color)
      // .on('dblclick', zoneDblClick)
      // .call(d3.drag()
      // .on('start', dragZoneStart)
      // .on('drag', dragZoneProgress)
      // .on('end', dragZoneEnd))
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    entry.append('text')
      .text(function (d) { return d.status; })
      .attr('x', 10)
      .attr('y', slotHeight / 3)
      .attr('dy', '0.5ex')
      .attr('text-anchor', 'start')
      .attr('class', 'laneText');
  }

  function dragProgress() {
    const [start, end] = [timeDomainStart, timeDomainEnd];
    let duration = -d3.event.dx * (actualEnd / 200);
    updateAxisX(getDatePlusDuration(start, duration), getDatePlusDuration(end, duration), 0);
  }

  function scrollZoom() {
    if (d3.event.transform.k > startZoomK) {
      zoomAxisX('in');
    }
    else if (d3.event.transform.k < startZoomK) {
      zoomAxisX('out');
    }
    startZoomK = d3.event.transform.k;
  }

  function zoomAxisX(dir) {
    const [start, end] = [timeDomainStart, timeDomainEnd];
    const durationVisible = end - start;

    if (dir === 'in') {
      var tempStart = getDatePlusDuration(start, diff);
      var tempEnd = getDatePlusDuration(end, -diff);
      if ((tempEnd - tempStart) > 1000) {
        updateAxisX(getDatePlusDuration(start, diff), getDatePlusDuration(end, -diff));
        timeDomainStart = tempStart;
        timeDomainEnd = tempEnd;
      }


    }
    else if (dir === 'out') {
      var tempStart = getDatePlusDuration(start, -diff);
      var tempEnd = getDatePlusDuration(end, diff);
      if (tempStart < 0) {
        timeDomainStart = 0;
      } else {
        timeDomainStart = tempStart;
      }
      if (tempEnd > actualEnd) {
        timeDomainEnd = actualEnd;
      } else {
        timeDomainEnd = tempEnd;
      }
      updateAxisX(timeDomainStart, timeDomainEnd);
    }
  }


  function updateAxisX(start, end, animDuration = 200) {
    timeDomainStart = start;
    timeDomainEnd = end;

    const trans = d3.transition().ease(d3.easeLinear).duration(animDuration);

    scaleX.domain([start, end]);
    elAxisX.transition(trans).call(axisX);

    elContainer.selectAll('.slot')
      .transition(trans)
      .attr('transform', rectTransform)
      .attr('width', d => scaleX(getEnd(d)) - scaleX(getStart(d)));


    elContainer.selectAll('.slot')
      .transition(trans)
      .select('.zone')
      .attr('width', d => scaleX(getEnd(d)) - scaleX(getStart(d)));
  }


  function getDurationBetween(dateA, dateB) {
    return (dateB - dateA);
  }
  
  function getDatePlusDuration(date, duration) {
    return date + duration;
  }

  function getStart(d) {
    if (d) {
      return getDatePlusDuration(0, d.startDate);
    }
  }

  function getEnd(d) {
    if (d)
      return getDatePlusDuration(getStart(d), d.endDate - d.startDate);
  }


  gantt.taskTypes = function (value) {
    if (!arguments.length)
      return taskTypes;
    taskTypes = value;
    return gantt;
  };

  gantt.taskStatus = function (value) {
    if (!arguments.length)
      return taskStatus;
    taskStatus = value;
    return gantt;
  };

  return gantt;
};

