import React from "react";

import {ISync} from "../../common/coordinator";
import {CoordinatorContainer} from "../../common/CoordinatorContainer";
import {Loading} from "../../common/Loading";
import {NextDelta} from "./NextDelta";

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
        {(lastSync, isLoading) => {
          if (isLoading) {
            return <Loading />;
          }

          return <NextDelta />;
        }}
      </CoordinatorContainer>
    </>
  );
}
