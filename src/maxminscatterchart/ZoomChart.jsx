'use strict';

var React = require('react');
var d3 = require('d3');
var { Chart, XAxis, YAxis } = require('../common');
var DataSeries = require('./DataSeries');
var pdebug = require('../debug')('ZoomChart');
var { ViewBoxMixin } = require('../mixins');
var clipPathStyle = {
  'clip-path':'url(#chart-area-clip)',
  'pointer-events':'all'
};
import  {
  sortBy,
  findIndex,
  isDate
} from 'lodash';
const styleZoomIn = {
  cursor: 'zoom-in'
};
module.exports = React.createClass({
  displayName: 'ZoomChart',
  propTypes: {
    currentIndex:           React.PropTypes.number,
    data:                   React.PropTypes.array.isRequired,
    dataMarker:             React.PropTypes.func,
    height:                 React.PropTypes.number.isRequired,
    isMobile:               React.PropTypes.bool,
    margins:                React.PropTypes.object,
    strokeWidth:            React.PropTypes.number,
    width:                  React.PropTypes.number.isRequired,
    xAxisClassName:         React.PropTypes.string,
    xAxisStrokeWidth:       React.PropTypes.number,
    xAxisUnit:              React.PropTypes.string,
    xScale:                 React.PropTypes.func.isRequired,
    yAxisClassName:         React.PropTypes.string,
    yAxisLabel:             React.PropTypes.string,
    yAxisOffset:            React.PropTypes.number,
    yAxisStrokeWidth:       React.PropTypes.number,
    yScale:                 React.PropTypes.func.isRequired
 },

  mixins: [
    ViewBoxMixin
   ],
  getDefaultProps() {
    return {
      currentIndex:           0,
      circleRadius:           3,
      className:              'rd3-max-min-scatter-chart',
      hoverAnimation:         true,
      margins:  {
        top: 10
        , right: 20
        , bottom: 50
        , left: 45
      },
      dataSeriesStrokeWidth:  2,
      dataMarkerSize:         8,
      xAxisClassName:         'rd3-max-min-scatter-chart-xaxis',
      xAxisStrokeWidth:       1,
      yAxisClassName:         'rd3-max-min-scatter-chart-yaxis',
      yAxisStrokeWidth:       1
    };
  },
  getInitialState(){
    return {
      currentValue: this.props.data[this.props.currentIndex].coord
      , zooming: false
    };
  },
  componentDidMount(){
    this.initZoom();
  },
  componentDidUpdate(){
    if(this.props.xScale.id !== this.xScaleId && this.props.yScale.id !== this.yScaleId )
    this.initZoom();
  },
  chartOffSet: function(){
    var x = this.props.yAxisOffset < 0 ? (this.props.margins.left + Math.abs(this.props.yAxisOffset)) : this.props.margins.left;
    return `translate(${x}, ${this.props.margins.top})`;
  },
  zoomed: function(){
    pdebug('#zoomed', d3.event.sourceEvent);
    // d3.event.preventDefault();
    let {
      scale
    } = d3.event;
    let {
      currentScale
    } = this.state;
    this.setState({
      lastScale: currentScale,
      currentScale: scale,
      strokeWidth: this.props.strokeWidth
    });
  },
  /**
   * Initialize d3 zoom
   * @return {Function} returns zoom instance.
   */
  initZoom: function(){
    pdebug('mouseRect', this.refs.mouseRect.getScreenCTM());
    let ctx = this;
    pdebug('#initZoom');
    var {
      xScale,
      yScale
    } = this.props;
    var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .xExtent(xScale.domain())
    .yExtent(yScale.domain());
    zoom.x(xScale);
    zoom.y(yScale);
    this.xScaleId = xScale.id;
    this.yScaleId = yScale.id;
    pdebug(`#initZoom ${xScale.id}`);
    var chartNode = d3.select(this.refs.clipPath);
    zoom(chartNode);
    zoom.on('zoom', this.zoomed);
    zoom.on('zoomstart', () => {
      pdebug(`zoomstart`);
      ctx.setState({zooming: true});
    });
    zoom.on('zoomend', () => {
      pdebug(`zoomend`);
      ctx.setState({zooming: false});
    });
    return zoom;
  },
  DataMarkerClick: function(value){
    pdebug(`#DataMarkerClick ${JSON.stringify(value)}`);
    this.setState({currentValue: value});
  },
  getValueIndex: function(value, sortAxis){
    let {
      data
    } = this.props;
    let _data = data.map((value)=>{
      return value.coord;
    });
    _data = sortBy(_data, (value)=>{
      return value[sortAxis];
    });
    return findIndex(_data, sortAxis, value[sortAxis]);
  }
  , getValueAtIndex(index, sortAxis){
    let {
      data
    } = this.props;
    let _data = data.map((value)=>{
      return value.coord;
    });
    _data = sortBy(_data, (value)=>{
      return value[sortAxis];
    });
    return _data[index];
  }
  , changeCurrentValue(opts){
    let {
      nextValue
      , orient
    } = opts;
    let {
      currentValue
    } = this.state;
    let {
      data
    } = this.props;
    let sortAxis = orient.match(/top|bottom/)?'x':'y';
    let lastIndex = data.length-1;
    let currentIndex = this.getValueIndex(currentValue, sortAxis);
    let nextIndex = nextValue === 'next'?currentIndex+1:currentIndex-1;
    nextValue = this.getValueAtIndex(nextIndex, sortAxis);
    nextValue.isLast = nextIndex >= lastIndex;
    nextValue.isFirst = nextIndex <= 0;
    this.setState({currentValue: nextValue});
  }
  , mouseEventRectStyle() {
    let {
      currentScale,
      lastScale,
      zooming
    } = this.state;
    let style = {};
    // if(zooming === false)
    // return style;
    if(currentScale < lastScale)
    style.cursor = 'zoom-out';
    if(currentScale > lastScale)
    style.cursor = 'zoom-in';
    return style;
  }
  , render() {
    pdebug('#render');
    var props = this.props;
    var {
      data
      , dataMarker
      , height
      , innerDimensions
      , isMobile
      , margins
      , strokeWidth
      , width
      , yScale
      , xScale
    } = props;
    var transform = this.chartOffSet();
    var {
      height: innerHeight
      , width: innerWidth
    } = innerDimensions;
    var {
      currentValue
      , zooming
    } = this.state;
    pdebug(`currentValue: ${JSON.stringify(currentValue)}`);
    pdebug(`#render zooming: ${zooming}`);
    if (!data || data.length < 1) {
      return null;
    }
    let mouseEventRectStyle = this.mouseEventRectStyle();
    clipPathStyle = {...clipPathStyle, ...mouseEventRectStyle};
    return (
      <Chart
          colorAccessor={props.colorAccessor}
          colors={props.colors}
          data={data}
          height={height}
          legend={props.legend}
          margins={margins}
          ref="Chart"
          title={props.title}
          viewBox={this.getViewBox()}
          width={width}>
          <style>
            {`
              .rd3-max-min-scatter-chart{
                -webkit-tap-highlight-color: rgba(0,0,0,0);
              }
            `}
          </style>
        <defs>
          <clipPath id="chart-area-clip">
            <rect
                height={innerHeight}
                width={innerWidth}
                x="0"
                y="0"/>
          </clipPath>
        </defs>
        <g
            className={props.className}
            transform={transform}>
        {zooming && isMobile ? null :
          <g>
            <XAxis
                currentValueChange={this.changeCurrentValue}
                data={data}
                gridVertical={props.gridVertical}
                gridVerticalStroke={props.gridVerticalStroke}
                gridVerticalStrokeDash={props.gridVerticalStrokeDash}
                gridVerticalStrokeWidth={props.gridVerticalStrokeWidth}
                height={innerHeight}
                isMobile={isMobile}
                margins={margins}
                ref="xAxis"
                stroke={props.axesColor}
                strokeWidth={props.xAxisStrokeWidth.toString()}
                tickFormatting={props.xAxisFormatter}
                tickSize={0}
                value={currentValue}
                width={innerWidth}
                xAxisClassName={props.xAxisClassName}
                xAxisLabel={props.xAxisLabel}
                xAxisLabelOffset={props.xAxisLabelOffset}
                xAxisOffset={props.xAxisOffset}
                xAxisTickInterval={props.xAxisTickInterval}
                xAxisTickValues={props.xAxisTickValues}
                xOrient={props.xOrient}
                xScale={xScale}
                yOrient={props.yOrient}
                yScale={yScale}
                zooming={zooming}
            />
            <YAxis
                currentValueChange={this.changeCurrentValue}
                data={data}
                gridHorizontal={props.gridHorizontal}
                gridHorizontalStroke={props.gridHorizontalStroke}
                gridHorizontalStrokeDash={props.gridHorizontalStrokeDash}
                gridHorizontalStrokeWidth={props.gridHorizontalStrokeWidth}
                height={innerHeight}
                isMobile={isMobile}
                margins={margins}
                stroke={props.axesColor}
                strokeWidth={props.yAxisStrokeWidth.toString()}
                tickFormatting={props.yAxisFormatter}
                tickSize={0}
                value={currentValue}
                width={innerWidth}
                xOrient={props.xOrient}
                xScale={xScale}
                yAxisClassName={props.yAxisClassName}
                yAxisLabel={props.yAxisLabel}
                yAxisLabelOffset={props.yAxisLabelOffset}
                yAxisOffset={props.yAxisOffset}
                yAxisTickCount={props.yAxisTickCount}
                yAxisTickValues={props.yAxisTickValues}
                yOrient={props.yOrient}
                yScale={yScale}
                zooming={zooming}
            />
          </g>
        }
        <g
            ref="clipPath"
            style={clipPathStyle}>
          <rect
              ref="mouseRect"
              fill="transparent"
              height={innerHeight}
              width={innerWidth}/>
          <DataSeries
              currentValue={currentValue}
              data={data}
              DataMarker={dataMarker}
              DataMarkerClick={this.DataMarkerClick}
              height={innerHeight}
              isMobile={isMobile}
              strokeWidth={strokeWidth}
              width={innerWidth}
              xScale={xScale}
              yScale={yScale}
              zooming={zooming}
              />
        </g>
        </g>
      </Chart>
    );
  }

});
