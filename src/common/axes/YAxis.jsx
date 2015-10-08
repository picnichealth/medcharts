'use strict';

var React = require('react');
var d3 = require('d3');
var AxisTicks = require('./AxisTicks');
var AxisLine = require('./AxisLine');
var Label = require('./Label');
var pdebug = require('../../debug')('YAxis');

import YAxisSelectedLabel from './YAxisSelectedLabel';

module.exports = React.createClass({

  displayName: 'YAxis',

  propTypes: {
    fill:            React.PropTypes.string,
    value:           React.PropTypes.object,
    stroke:          React.PropTypes.string,
    strokeWidth:     React.PropTypes.string,
    tickStroke:      React.PropTypes.string,
    width:           React.PropTypes.number.isRequired,
    height:          React.PropTypes.number.isRequired,
    yAxisClassName:  React.PropTypes.string,
    yAxisLabel:      React.PropTypes.string,
    yAxisOffset:     React.PropTypes.number,
    yAxisTickValues: React.PropTypes.array,
    xOrient:         React.PropTypes.oneOf(['top', 'bottom']),
    yOrient:         React.PropTypes.oneOf(['left', 'right']),
    yScale:          React.PropTypes.func.isRequired,
    gridVertical: React.PropTypes.bool,
    gridVerticalStroke: React.PropTypes.string,
    gridVerticalStrokeWidth: React.PropTypes.number,
    gridVerticalStrokeDash: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      fill:           'none',
      stroke:         '#000',
      strokeWidth:    '1',
      tickStroke:     '#000',
      yAxisClassName: 'rd3-y-axis',
      yAxisLabel:     '',
      yAxisOffset:    0,
      xOrient:        'bottom',
      yOrient:        'left'
    };
  },

  render() {
    pdebug('#render')
    var props = this.props;
    pdebug(props.height)
    pdebug(props.yScale.range())
    let {
      value
      , xScale
    } = this.props;
    value = value || {};
    pdebug(`#render ${JSON.stringify(value)}`);
    let {
      x
      , y
    } = value;
    let markerHeight = x?xScale(x):0;
    var t;
    if (props.yOrient === 'right') {
       t = `translate(${props.yAxisOffset + props.width}, 0)`;
    } else {
       t = `translate(${props.yAxisOffset}, 0)`;
    }

    var tickArguments;
    if (props.yAxisTickCount) {
      tickArguments = [props.yAxisTickCount];
    }

    if (props.yAxisTickInterval) {
      tickArguments = [d3.time[props.yAxisTickInterval.unit], props.yAxisTickInterval.interval];
    }

    return (
      <g
        className={props.yAxisClassName}
        transform={t}
      >
        <AxisTicks
          innerTickSize={props.tickSize}
          orient={props.yOrient}
          orient2nd={props.xOrient}
          tickArguments={tickArguments}
          tickFormatting={props.tickFormatting}
          tickStroke={props.tickStroke}
          tickTextStroke={props.tickTextStroke}
          tickValues={props.yAxisTickValues}
          scale={props.yScale}
          height={props.height}
          width={props.width}
          gridHorizontal={props.gridHorizontal}
          gridHorizontalStroke={props.gridHorizontalStroke}
          gridHorizontalStrokeWidth={props.gridHorizontalStrokeWidth}
          gridHorizontalStrokeDash={props.gridHorizontalStrokeDash}
        />
        <AxisLine
          orient={props.yOrient}
          outerTickSize={props.tickSize}
          scale={props.yScale}
          stroke={props.stroke}
          {...props}
        />
      {y?
          <YAxisSelectedLabel
            value={y}
            scale={props.yScale}
            orient={props.yOrient}
            maxPosition={props.height}
            markerHeight={markerHeight}
            />:null
        }
        <Label
          height={props.height}
          label={props.yAxisLabel}
          margins={props.margins}
          offset={props.yAxisLabelOffset}
          orient={props.yOrient}
        />
      </g>
    );
  }

});