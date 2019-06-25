import React from "react";

import {IDesiredState, IDesiredUnit} from "../../common/coordinator";
import {CoordinatorContainer} from "../../common/CoordinatorContainer";
import {Loading} from "../../common/Loading";
import {ServiceForm} from "./ServiceForm";

const nullDesiredState: IDesiredState = {units: []};

const initialValues: IDesiredUnit = {
  id: 0,
  path: "/etc/systemd/system/",
  type: "simple",
  secrets: [],
  env: {},
  volumes: {},
  ports: {},
};

interface ServiceEditorProps {
  match: {
    params: {
      id: string;
    };
  };
}

export function ServiceEditor(props: ServiceEditorProps) {
  if (props.match.params.id === "create") {
    return <ServiceForm mode="create" original={initialValues} />;
  }

  return (
    <CoordinatorContainer<IDesiredState>
      getter={c => c.getDesiredState()}
      nullValue={nullDesiredState}
    >
      {(state, isLoading) => {
        if (isLoading) {
          return <Loading />;
        }

        const original = state.units.find(
          u => u.id.toString() === props.match.params.id
        );
        if (original) {
          return <ServiceForm mode="update" original={original} />;
        }

        return (
          <div className="card bg-danger text-white">
            <div className="card-header">Unknown service ID</div>
            <div className="card-body">
              <p className="card-text">No service exists with that ID.</p>
            </div>
          </div>
        );
      }}
    </CoordinatorContainer>
  );
}
