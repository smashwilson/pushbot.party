import React from "react";

import {IDesiredState} from "../../common/coordinator";
import {CoordinatorContainer} from "../../common/CoordinatorContainer";
import {Loading} from "../../common/Loading";
import {ServiceDisplay} from "./ServiceDisplay";

import "./Services.css";

const nullDesiredState: IDesiredState = {units: []};

export function Services() {
  return (
    <>
      <h3>Services</h3>
      <CoordinatorContainer<IDesiredState>
        getter={c => c.getDesiredState()}
        nullValue={nullDesiredState}
      >
        {(state, isLoading) => {
          if (isLoading) {
            return <Loading />;
          }

          return (
            <>
              {state.units.map(unit => (
                <ServiceDisplay unit={unit} key={unit.id} />
              ))}
            </>
          );
        }}
      </CoordinatorContainer>
    </>
  );
}
