'use strict';

var expect = require('chai').expect;

describe('LineChart', function() {
  if(process.env.TEST_ENV !== 'karma')
  
  it('renders multi-series linechart with array of objects data', function() {
    var React = require('react/addons');
    var LineChart = require('../../src/linechart').LineChart;
    var generate = require('../utils/datagen').generateArrayOfPoints;
    var TestUtils = React.addons.TestUtils;
    var length = 5;

    // Render a linechart using array data
    var data = [
      {
        name: "series1",
        values: generate(length)
      },
      {
        name: "series2",
        values: generate(length)
      }
    ];
    var linechart = TestUtils.renderIntoDocument(
      <LineChart data={data} width={400} height={200} />
    );

    // Verify that it has the same number of path as the array's length
    var paths = TestUtils.scryRenderedDOMComponentsWithClass(
      linechart, 'rd3-linechart-path');
    expect(paths).to.have.length(Object.keys(data).length);

    var circles = TestUtils.scryRenderedDOMComponentsWithClass(
      linechart, 'rd3-linechart-circle');
    expect(circles).to.have.length(Object.keys(data).length * length);
  });
});
