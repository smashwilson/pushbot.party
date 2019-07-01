import React, {useContext} from "react";
import cx from "classnames";

import {CoordinatorContext, ISync} from "../../common/coordinator";
import {PendingDiffContext} from "../../common/PendingDiff";
import {NotificationContext} from "../../common/Notifications";
import {DeltaView, pastTense, futureTense} from "./DeltaView";
import {SyncReportView, PlaceholderSyncReportView} from "./SyncReportView";

interface SyncViewProps {
  lastSync: ISync;
  refresh: () => void;
}

export function SyncView(props: SyncViewProps) {
  const coordinator = useContext(CoordinatorContext);
  const pendingDiff = useContext(PendingDiffContext);
  const hub = useContext(NotificationContext);

  const lastDelta = props.lastSync.delta;
  const lastReport = props.lastSync.reports[props.lastSync.reports.length - 1];
  const inProgress = props.lastSync.in_progress;

  async function startSync(evt: React.MouseEvent<HTMLButtonElement>) {
    try {
      evt.preventDefault();
      await coordinator.createSync();
      props.refresh();
    } catch (err) {
      hub.addError(err);
    }
  }

  if (inProgress) {
    setTimeout(() => {
      props.refresh();
      pendingDiff.refresh();
    }, 1000);
  }

  return (
    <>
      <DeltaView
        delta={pendingDiff.delta}
        emptyText="No changes waiting to be applied."
        headerText="changes to apply"
        tense={futureTense}
      />
      <p className="mt-2 mb-4">
        <button
          className="btn btn-primary"
          disabled={inProgress}
          onClick={startSync}
        >
          <i
            className={cx("fas fa-sync-alt mr-2", {
              "fa-spin": inProgress,
            })}
          />
          Sync
        </button>
      </p>
      <div className="my-3">
        <h6>{inProgress ? "current " : "most recent "} sync</h6>
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
