import React, {Component} from "react";
import {BarChart, BarChartData, BarChartOptions, Plugin} from "chartist";

const ctHtmlLabels: Plugin = function (chart: any) {
  chart.on("draw", function (context: any) {
    if (context.type === "label") {
      context.element.empty()._node.innerHTML = context.text;
    }
  });
};

interface ChartProps {
  data: BarChartData;
  options: BarChartOptions;
}

export class Chart extends Component<ChartProps> {
  private refElement?: HTMLElement | null;
  private chart?: BarChart;

  render() {
    return (
      <div
        className="ct-chart ct-golden-section"
        ref={(c) => {
          this.refElement = c;
        }}
      />
    );
  }

  componentDidMount() {
    const options = this.props.options || {};
    options.plugins = [ctHtmlLabels];

    if (this.refElement) {
      this.chart = new BarChart(this.refElement, this.props.data, options);
    }
  }

  componentWillUnmount() {
    this.chart && this.chart.detach();
  }
}
