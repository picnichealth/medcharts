'use strict';

var React = require('react');
var pdebug = require('../../debug')('YAxisSelectedLabel');
import tweenState
, {
  stackBehavior
  , Mixin as tweenStateMixin
} from 'react-tween-state';
import moment from 'moment';
const baseClassName = 'selected-value-label';
const textStyle = {
  "alignment-baseline":"center"
}
module.exports = React.createClass({
  mixins:[tweenStateMixin],
  displayName: 'YAxisSelectedLabel',

  propTypes: {
    radius:              React.PropTypes.number,
    markerHeight:        React.PropTypes.number,
    maxPostion:          React.PropTypes.number.isRequired,
    offset:              React.PropTypes.number,
    horizontalTransform: React.PropTypes.string,
    value:               React.PropTypes.number.isRequired,
    strokeWidth:         React.PropTypes.number,
    textAnchor:          React.PropTypes.string,
    scale:               React.PropTypes.func.isRequired,
    verticalTransform:   React.PropTypes.string,
    fill:                React.PropTypes.string,
    currentValueChange:  React.PropTypes.func
  },

  getDefaultProps() {
    return {
      horizontalTransform: 'rotate(270)',
      strokeWidth:         2,
      textAnchor:          'middle',
      verticalTransform:   'rotate(0)',
      cornerRadius:        5,
      radius:              15,
      offset:              15,
      fill:                '#ecf0f1',
      arrowClassName:      `${baseClassName}-arrow`,
      containerClassName:      `${baseClassName}-container`,
      margins:             {
        left: 5
        , right: 5
        , top: 5
        , bottom: 5
      },
      leftPath:             "M1171 1235l-531 -531l531 -531q19 -19 19 -45t-19 -45l-166 -166q-19 -19 -45 -19t-45 19l-742 742q-19 19 -19 45t19 45l742 742q19 19 45 19t45 -19l166 -166q19 -19 19 -45t-19 -45z",
      rightPath: "M1107 659l-742 -742q-19 -19 -45 -19t-45 19l-166 166q-19 19 -19 45t19 45l531 531l-531 531q-19 19 -19 45t19 45l166 166q19 19 45 19t45 -19l742 -742q19 -19 19 -45t-19 -45z",
      animationDuration:  200
    };
  }
  , getInitialState(){
    return {
      opacity: 0
      , visible: false
      , position: 0
      , markerHeight: 0
    }
  }
  , adjustedScale(scale){
    scale = scale || this.props.scale;
    return scale.rangeBand ? (d) => { return scale(d) + scale.rangeBand() / 2; } : scale;
  }
  , hide(){
    let {
      visible
      , opacity
    } = this.state;
    let {
      animationDuration
    } = this.props;
    if(!visible)return;
    this.setState({visible: false})
    this.tweenState('opacity', {
      easing: tweenState.easingTypes.linear
      , duration: animationDuration
      , beginValue: 1
      , endValue: 0
    })
  }
  , show(){
    let {
      visible
    } = this.state;
    let {
      animationDuration
    } = this.props;
    if(visible)return;
    this.setState({visible: true});
    this.tweenState('opacity', {
      easing: tweenState.easingTypes.linear
      , duration: animationDuration
      , beginValue: 0
      , endValue: 1
    })
  }
  , isVisible(scale){
    let {
      value
      , radius
      , maxPosition
    } = this.props;
    let _value = this.adjustedScale(scale)(value);
    let offset = radius/2;
    _value = _value >= offset && _value <=this.props.maxPosition - offset;
    return _value;
  }
  , translateY(value){
    return `translate(${value},0)`;
  }
  , translateX(value){
    return `translate(0,${value})`;
  }
  , componentDidMount(){
    this.initPosition();
    this.initVisibility();
  }
  , componentWillReceiveProps(props){
    this.initPosition(props);
    this.initVisibility();
  }
  , animateState(key, opts){
    let ctx = this;
    return new Promise((resolve, reject) => {
      opts.onEnd = resolve;
      ctx.tweenState(key, opts);
    })
  }
  , async initPosition(props){
    let ctx = this;
    props = props || this.props;
    let {
      scale
      , value
      , markerHeight
    } = props;
    let {
      position: previous
    } = this.state;
    this.setState({markerHeight: 0})
    let newPosition = this.adjustedScale(scale)(value);
    let {
      animationDuration
    } = this.props;
    await ctx.animateState('position', {
      easing: tweenState.easingTypes.easeOutElastic
      , duration: animationDuration + 200
      , beginValue: previous
      , endValue: newPosition
    })
    this.setState({markerHeight: markerHeight})
  }
  , initVisibility(){
    if(this.isVisible()){
      return this.show();
    }
    this.hide();
  }
  , onClickLeft(){
    let opts = {
      nextValue: 'previous'
      , orient: this.props.orient
    }
    this.props.currentValueChange(opts)
  }
  , onClickRight(){
    let opts = {
      nextValue: 'next'
      , orient: this.props.orient
    }
    this.props.currentValueChange(opts)
  }
  , render() {
    let {
      orient
      , verticalTransform
      , horizontalTransform
      , strokeWidth
      , textAnchor
      , offset
      , cornerRadius
      , fill
      , margins
      , arrowClassName
      , containerClassName
      , leftPath
      , rightPath
      , value
      , isLast
      , isFirst
      , radius
    } = this.props;
    let {
      opacity
      , position
      , markerHeight
    } = this.state;
    let x1 = radius;
    let x2 = radius + markerHeight;
    opacity = this.getTweeningValue('opacity')|| opacity;
    position = this.getTweeningValue('position') || position;
    if(!value)return null;
    let transform = orient.match(/top|bottom/)?verticalTransform:horizontalTransform;
    let translate = orient.match(/top|bottom/)?this.translateY(position):this.translateX(position)
      return (
        <g
          transform={translate}
          opacity={opacity}>
          <g
            transform={`translate(-${offset},0)`}>
            <g>
              <circle
                className={`${baseClassName}-line-marker`}
                fill={fill}
                strokeWidth={strokeWidth}
                opacity="1"
                r={radius}/>
              <text
                strokeWidth={strokeWidth.toString()}
                textAnchor={textAnchor}
                style={textStyle}
                transform={verticalTransform}>
                {value}
              </text>
            </g>
            <line
              className={`${baseClassName}-line-marker`}
              stroke="#3182bd"
              strokeWidth={strokeWidth}
              opacity="1"
              strokeDasharray="3,3"
              x1={x1}
              x2={x2}
              y1="0"
              y2="0"/>
            {/*
              */}
          </g>
        </g>
      );
    }
});