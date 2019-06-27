import React, {useContext} from "react";
import cx from "classnames";

import {ISync} from "../../common/coordinator";
import {PendingDiffContext} from "../../common/PendingDiff";
import {DeltaView, pastTense, futureTense} from "./DeltaView";
import {SyncReportView, PlaceholderSyncReportView} from "./SyncReportView";

interface SyncViewProps {
  lastSync: ISync;
}

export function SyncView(props: SyncViewProps) {
  const delta = useContext(PendingDiffContext);
  const lastDelta = props.lastSync.delta;
  const lastReport = props.lastSync.reports[props.lastSync.reports.length - 1];

  return (
    <>
      <DeltaView
        delta={delta}
        emptyText="No changes waiting to be applied."
        headerText="changes to apply"
        tense={futureTense}
      />
      <p className="mt-2 mb-4">
        <button
          className="btn btn-primary"
          disabled={props.lastSync.in_progress}
        >
          <i
            className={cx("fas fa-sync-alt mr-2", {
              "fa-spin": props.lastSync.in_progress,
            })}
          />
          Sync
        </button>
      </p>
      <div className="my-3">
        <h6>{props.lastSync.in_progress ? "current " : "most recent "} sync</h6>
        <SyncReportView reports={props.lastSync.reports} />
        {props.lastSync.in_progress && (
          <PlaceholderSyncReportView lastReport={lastReport} />
        )}
      </div>
      {lastDelta && (
        <DeltaView
          delta={lastDelta}
          emptyText="No changes applied."
          headerText="applied changes"
          tense={pastTense}
        />
      )}
    </>
  );
}
