import * as d3 from "d3";
import { SymbolType } from "d3-shape";
import { Task } from '../task/task';

enum TimeUnit { ps, ns, μs, ms, s, min, }

class SymbolWrapper {
    constructor(public name: string, public symbol: SymbolType) {
    }
}
export class GanttChart {

    private timeDomainStart: number = 0;
    private timeDomainEnd: number = 10;
    private diff: number = 10;
    private readonly dragFactor: number = 200;
    private diffFactor: number = 100;
    //Default size
    private WIDTH = 1400;
    private HEIGHT = 900;

    private readonly MARGIN = 100;
    private margin = {
        top: 20,
        right: this.MARGIN,
        bottom: 50,
        left: this.MARGIN
    };

    private readonly GAP = 60;
    private readonly SLOTHEIGHT = 50;


    private startZoomK:number;
    private brushHeight = 60;
    private brushScaleX:any;
    private brushScaleY:any;

    constructor() {

    }

    createGanntChart() {

        // create the standard chart
        let svg = d3.select(".chart")
            .attr("width", this.WIDTH + this.margin.left + this.margin.right)
            .attr("height", this.HEIGHT + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


        let symbols = [
            new SymbolWrapper('Cross', d3.symbolCross),
            new SymbolWrapper('Circle', d3.symbolCircle),
            new SymbolWrapper('Diamond', d3.symbolDiamond),
            new SymbolWrapper('Square', d3.symbolSquare),
            new SymbolWrapper('Star', d3.symbolStar),
            new SymbolWrapper('Triangle', d3.symbolTriangle),
            new SymbolWrapper('Wye', d3.symbolWye)
        ];

        let color = d3.scaleOrdinal()
            .domain(symbols.map(s => s.name))
            .range(d3.schemeCategory10);

        let xBand = d3.scaleBand()
            .domain(symbols.map(s => s.name))
            .range([0, this.WIDTH])
            .paddingInner(0.1);

        let symbolGroups = svg.selectAll(".symbol").data(symbols)
            .enter()
            .append("g")
            .attr("class", d => "symbol")
            .attr("transform", d => `translate(${xBand(d.name)} 40)`)

        symbolGroups
            .append("path")
            .attr("fill", d => <string>color(d.name))
            .attr("d", d => d3.symbol().size(2400).type(d.symbol)());
    }

}