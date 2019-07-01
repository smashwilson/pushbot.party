import React from "react";

import {ISync} from "../../common/coordinator";
import {CoordinatorContainer} from "../../common/CoordinatorContainer";
import {Loading} from "../../common/Loading";
import {SyncView} from "./SyncView";

import "./Sync.css";

const nullSync: ISync = {
  in_progress: false,
  reports: [],
  errors: [],
};

export function Sync() {
  return (
    <>
      <h3>sync</h3>
      <CoordinatorContainer<ISync>
        getter={c => c.getSync()}
        nullValue={nullSync}
      >
        {(lastSync, isLoading, refresh) => {
          if (isLoading && lastSync.reports.length === 0) {
            return <Loading />;
          } else {
            return <SyncView lastSync={lastSync} refresh={refresh} />;
          }
        }}
      </CoordinatorContainer>
    </>
  );
}
