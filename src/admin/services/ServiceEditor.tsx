import React from "react";
import { useParams } from "react-router-dom";

import {IDesiredState} from "../../common/coordinator";
import {CoordinatorContainer} from "../../common/CoordinatorContainer";
import {Loading} from "../../common/Loading";
import {ServiceForm} from "./ServiceForm";
import {DesiredUnitPayload} from "./serviceTypes";

const nullDesiredState: IDesiredState = {units: []};

export function ServiceEditor() {
  const params = useParams();

  return (
    <CoordinatorContainer<string[]> getter={c => c.getSecrets()} nullValue={[]}>
      {(knownSecrets, secretsLoading) => {
        if (params.id === "create") {
          return (
            <ServiceForm
              payload={new DesiredUnitPayload()}
              knownSecrets={knownSecrets}
            />
          );
        }

        return (
          <CoordinatorContainer<IDesiredState>
            getter={c => c.getDesiredState()}
            nullValue={nullDesiredState}
          >
            {(state, stateIsLoading) => {
              if (stateIsLoading || secretsLoading) {
                return <Loading />;
              }

              const reqID = decodeURIComponent(params.id || "");
              const original = state.units.find(u => u.id.toString() === reqID);
              if (original) {
                return (
                  <ServiceForm
                    payload={new DesiredUnitPayload(original)}
                    knownSecrets={knownSecrets}
                  />
                );
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
      }}
    </CoordinatorContainer>
  );
}
