export const config = {
  domOutput: () => { throw new Error("The config.domOutput function has not been set for pygal."); },
};

const COLORS = [
  [255, 89, 149],  [182, 227, 84],  [254, 237, 108], [140, 237, 255],
  [158, 111, 254], [137, 156, 161], [248, 248, 242], [191, 70, 70],
  [81, 96, 131],   [249, 38, 114],  [130, 180, 20],  [253, 151, 31],
  [86, 194, 214],  [128, 131, 132], [140, 84, 254],  [70, 84, 87]
];

const some = (val) => typeof val !== "undefined";

class Chart {
  constructor({ title, width, height, range, include_x_axis, x_title, y_title, title_font_size, fill, stroke, x_labels } = {}) {
    const options = {};
    if (some(title)) options.title = title.v;
    if (some(width)) options.width = width.v;
    if (some(height)) options.height = height.v;
    if (some(range)) options.range = {
      min: range.v[0].v,
      max: range.v[1].v
    };
    if (some(include_x_axis)) options.include_x_axis = include_x_axis.v;
    if (some(x_title)) options.x_title = x_title.v;
    if (some(y_title)) options.y_title = y_title.v;
    if (some(title_font_size)) options.title_font_size = title_font_size.v;
    if (some(fill)) options.fill = fill.v;
    if (some(stroke)) options.stroke = stroke.v;
    if (some(x_labels)) options.x_labels = x_labels.v;

    this._options = options;
    this._data = [];
  }

  add(label, values) {
    this._data.unshift({
      name: label,
      color: this.#rgba(COLORS[this._data.length%COLORS.length], 0.75),
      data: [...values],
      marker : {
        symbol: 'circle'
      },
      stack : 1
    });

    return '';
  }

  render(renderer) {
    const options = this._options;
    const elem = config.domOutput('<div></div>');
    const title_style = {
      color: '#FFFFFF'
    };
    if (options.title_font_size) {
      title_style['font-size'] = options.title_font_size + 'px';
    }
    const xPlotLines = [];
    const yPlotLines = [];

    if (options.range) {
      yPlotLines.push({
        value: options.range.min,
        width: 1,
        color: '#FFFFFF'
      });
    }

    const defaultWidth  = config.availableWidth || 400;
    const defaultHeight = Math.min(defaultWidth, config.availableHeight || 300);

    const chart = {
      chart: {
        width : options.width  || defaultWidth,
        height: options.height || defaultHeight,
        backgroundColor: '#000'
      },
      credits: {
        enabled: false
      },
      title: {
          text: options.title,
          style : title_style
      },
      xAxis: {
          title: {
              text: options.x_title || null,
              style : title_style,
              margin: 20
          },
          categories: options.x_labels,
          labels : {
            enabled: options.x_labels ? true : false
          },
          tickLength: 0
      },
      yAxis: {
          startOnTick: false,
          title: {
              text: options.y_title || null,
              style : title_style,
              margin: 20
          },
          plotLines: yPlotLines,
          min : options.include_x_axis
            ? 0
            : options.range
              ? options.range.min
              : null,
          max : options.range ? options.range.max : null,
          gridLineDashStyle : 'ShortDash',
          gridLineColor: '#DDD',
          tickLength: 0
      },
      legend: {
          itemStyle : {
            color : '#FFFFFF'
          },
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          y: 50,
          borderWidth: 0
      },
      labels : {
        style : {
          color: '#FFFFFF'
        }
      },
      series: this._data
    };

    for(let i = 0; i < chart.series.length; i++) {
      chart.series[i].legendIndex = chart.series.length - i;
      chart.series[i].index = chart.series.length - i;
    }

    if (renderer) {
      chart = renderer(options, chart);
    }

    Highcharts.chart(elem, chart);

    return '';
  }

  #rgba(rgb, a) {
    return 'rgba(' + rgb.join(',') + ',' + a + ')';
  }
}

class _Line extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = options.fill ? 'area' : 'line';
      return chart;
    };
  }
}
export const Line = () => new _Line();

class _StackedLine extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = options.fill ? 'area' : 'line';
      chart.plotOptions = {
        area : {
          stacking : 'percent'
        },
        series : {
          stacking : 'percent'
        }
      };
      return chart;
    };
  }
}
export const StackedLine = () => new _StackedLine();

class _Bar extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = 'column';
      return chart;
    };
  }
}
export const Bar = () => new _Bar();

class _StackedBar extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = 'column';
      chart.plotOptions = {
        column : {
          stacking: 'percent'
        }
      };
      return chart;
    };
  }
}
export const StackedBar = () => new _StackedBar();

class _HorizontalBar extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = 'bar';
      return chart;
    };
  }
}
export const HorizontalBar = () => new _HorizontalBar();

class _StackedHorizontalBar extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = 'bar';
      chart.plotOptions = {
        bar : {
          stacking: 'percent'
        }
      };
      return chart;
    };
  }
}
export const StackedHorizontalBar = () => new _StackedHorizontalBar();

class _XY extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      if (options.stroke === false) {
        chart.chart.type = 'scatter'
      }
      else {
        chart.chart.type = options.fill ? 'area' : 'line';
      }
      chart.xAxis.labels.enabled = true;

      return chart;
    };
  }
}
export const XY = () => new _XY();

class _Radar extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.polar = true;
      chart.chart.type  = 'line';
      chart.xAxis = {
        categories: options.x_labels,
        tickmarkPlacement: 'on',
        lineWidth: 0
      }
      chart.yAxis = {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        gridLineDashStyle : 'ShortDash',
        gridLineColor: '#DDD'
      }
      for(let i = 0; i < chart.series.length; i++) {
        chart.series[i].pointPlacement = 'on';
      }

      return chart;
    };
  }
}
export const Radar = () => new _Radar();

class _Pie extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = 'pie';
      const slices       = [];
      const breakdown    = [];
      const useBreakdown = false;
      for(let i = 0; i < chart.series.length; i++) {
        const slice = chart.series[i];
        if (slice.data.length === 1) {
          slices.unshift({
            name        : slice.name,
            color       : slice.color,
            borderColor : slice.color,
            legendIndex : slice.legendIndex,
            y           : slice.data[0]
          });
          breakdown.unshift({
            name  : slice.name,
            color : slice.color,
            borderColor : slice.color,
            y     : slice.data[0]
          });
        }
        else {
          useBreakdown = true;
          const sum = 0;
          const maxDecimal = 0;
          for(let j = 0; j < slice.data.length; j++) {
            const parts = slice.data[j].toString().split('.');
            maxDecimal = Math.max(maxDecimal, parts[1] ? parts[1].length : 0);
            sum += slice.data[j];
            breakdown.unshift({
              name: slice.name,
              color: 'rgba(0,0,0,0)',
              borderColor : slice.color,
              y: slice.data[j]
            });
          }
          slices.unshift({
            name        : slice.name,
            color       : slice.color,
            borderColor : slice.color,
            legendIndex : slice.legendIndex,
            y           : parseFloat(sum.toFixed(maxDecimal))
          });
        }
      }
      chart.tooltip = {
        formatter: function() {
            return this.key + ': ' + this.y;
          }
      };
      chart.plotOptions = {
        pie: {
          allowPointSelect: !useBreakdown,
          cursor: useBreakdown ? null : 'pointer',
          shadow: false,
          center: ['50%', '50%'],
          dataLabels: {
            enabled: false
          }
        }
      };
      chart.series = [{
        name: ' ',
        data: slices,
        showInLegend: true
      }];
      if (useBreakdown) {
        chart.series.push({
          name: ' ',
          data: breakdown,
          innerSize: '90%',
          showInLegend: false
        });
      }
      return chart;
    };
  }
}
export const Pie = () => new _Pie();
