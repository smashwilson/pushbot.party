import React from "react";
import moment from "moment";

import {ISyncReport} from "../../common/coordinator";

const timeUnits: ("h" | "m" | "s" | "ms")[] = ["h", "m", "s", "ms"];

function reportDuration(d: moment.Duration): string {
  for (const timeUnit of timeUnits) {
    const count = d.get(timeUnit);
    if (count > 0) {
      return `${count}${timeUnit}`;
    }
  }
  return "<1ms";
}

interface FieldsViewProps {
  fields: {[fieldName: string]: any};
}

function FieldsView(props: FieldsViewProps) {
  const keys = Object.keys(props.fields);
  if (keys.length === 0) {
    return null;
  }

  return (
    <div className="row mt-1">
      <div className="col-1 px-2" />
      <div className="col-11">
        <ul className="list-group-horizontal p-0">
          {keys.map(key => (
            <li key={key} className="list-group-item px-2 py-0">
              <small className="text-muted mr-1">{key}:</small>
              <small className="text-monospaced">
                {props.fields[key].toString()}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface SyncReportViewProps {
  reports: ISyncReport[];
}

export function SyncReportView(props: SyncReportViewProps) {
  const reportRows = props.reports.map((report, index) => {
    const duration = moment.duration(report.elapsed);

    return (
      <li className="list-group-item row" key={index}>
        <div className="container">
          <div className="row">
            <div className="col-1 px-2 border-right d-flex justify-content-end pushbot-syncReport--duration">
              {reportDuration(duration)}
            </div>
            <div className="col-11 text-dark">{report.message}</div>
          </div>
          <FieldsView fields={report.fields} />
        </div>
      </li>
    );
  });

  return <ul className="list-group pushbot-syncReport">{reportRows}</ul>;
}

interface PlaceholderSyncReportView {
  lastReport?: ISyncReport;
}

export function PlaceholderSyncReportView(props: PlaceholderSyncReportView) {
  const elapsed = props.lastReport
    ? reportDuration(
        moment.duration(moment().diff(moment.unix(props.lastReport.timestamp)))
      )
    : "...";

  return (
    <li className="list-group-item row">
      <div className="container">
        <div className="row">
          <div className="col-1 border-right">{elapsed}</div>
          <div className="col-11">
            <i className="fas fa-circle-notch fa-spin text-dark" />
          </div>
        </div>
      </div>
    </li>
  );
}
