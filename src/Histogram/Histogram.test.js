import React from 'react';
import { mount } from 'enzyme';
import d3 from 'd3';
import { HistogramInner } from './Histogram';
import getFormattedBuckets from './Histogram/getFormattedBuckets';
import response from './data/responseTime.json';
import { getTimeFormatter, timeUnit } from '../formatters';
import { toJson } from '../testHelpers';

describe('Histogram', () => {
  let wrapper;
  const onClick = jest.fn();

  beforeEach(() => {
    const buckets = getFormattedBuckets(response.buckets, response.bucketSize);
    const xMax = d3.max(buckets, d => d.x);
    const timeFormatter = getTimeFormatter(xMax);
    const unit = timeUnit(xMax);

    wrapper = mount(
      <HistogramInner
        buckets={buckets}
        bucketSize={response.bucketSize}
        bucketIndex={null}
        onClick={onClick}
        formatX={timeFormatter}
        formatYShort={value => `${value} req.`}
        formatYLong={value => `${value} requests`}
        tooltipHeader={bucket =>
          `${timeFormatter(bucket.x0, false)} - ${timeFormatter(
            bucket.x,
            false
          )} ${unit}`
        }
        width={800}
      />
    );
  });

  describe('Initially', () => {
    it('should have default state', () => {
      expect(wrapper.state()).toEqual({ hoveredBucket: {} });
    });

    it('should have default markup', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should not show tooltip', () => {
      expect(wrapper.find('Tooltip').length).toBe(0);
    });
  });

  describe('when hovering over an empty bucket', () => {
    beforeEach(() => {
      wrapper
        .find('.rv-voronoi__cell')
        .at(2)
        .simulate('mouseOver');
    });

    it('should not display tooltip', () => {
      expect(wrapper.find('Tooltip').length).toBe(0);
    });
  });

  describe('when hovering over a non-empty bucket', () => {
    beforeEach(() => {
      wrapper
        .find('.rv-voronoi__cell')
        .at(7)
        .simulate('mouseOver');
    });

    it('should display tooltip', () => {
      const tooltips = wrapper.find('Tooltip');

      expect(tooltips.length).toBe(1);
      expect(tooltips.prop('header')).toBe('811 - 869 ms');
      expect(tooltips.prop('tooltipPoints')).toEqual([
        { value: '49 requests' }
      ]);
      expect(tooltips.prop('x')).toEqual(869010);
      expect(tooltips.prop('y')).toEqual(27.5);
    });

    it('should update state with "hoveredBucket"', () => {
      expect(wrapper.state()).toEqual({
        hoveredBucket: {
          sampled: true,
          style: { cursor: 'pointer' },
          transactionId: '99c50a5b-44b4-4289-a3d1-a2815d128192',
          x: 869010,
          x0: 811076,
          y: 49
        }
      });
    });

    it('should have correct markup for tooltip', () => {
      const tooltips = wrapper.find('Tooltip');
      expect(toJson(tooltips)).toMatchSnapshot();
    });
  });

  describe('when clicking on a non-empty bucket', () => {
    beforeEach(() => {
      wrapper
        .find('.rv-voronoi__cell')
        .at(7)
        .simulate('click');
    });

    it('should call onClick with bucket', () => {
      expect(onClick).toHaveBeenCalledWith({
        sampled: true,
        style: { cursor: 'pointer' },
        transactionId: '99c50a5b-44b4-4289-a3d1-a2815d128192',
        x: 869010,
        x0: 811076,
        y: 49
      });
    });
  });
});
