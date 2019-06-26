import React from "react";
import {Route} from "react-router-dom";
import memo from "memoize-one";

import {SideNav} from "./SideNav";
import {Dashboard} from "./dashboard/Dashboard";
import {People} from "./people/People";
import {Profile} from "./profile/Profile";
import {Quotes} from "./quotes/Quotes";
import {Events} from "./events/Events";
import {Recent} from "./recent/Recent";
import {Services} from "./admin/services/Services";
import {ServiceEditor} from "./admin/services/ServiceEditor";
import {UserContext, IUser} from "./common/Role";
import {CoordinatorContext, Coordinator} from "./common/coordinator";
import {PendingDiff} from "./common/PendingDiff";

interface AuthenticatedProps {
  user: IUser;
}

class StubCoordinator extends Coordinator {
  async getDesiredState() {
    return {
      units: [
        {
          id: 1,
          path: "/etc/systemd/system/az-pushbot.service",
          type: "simple" as "simple",
          container: {
            name: "pushbot",
            image_name: "quay.io/smashwilson/az-pushbot",
            image_tag: "latest",
          },
          secrets: ["AZ_COORDINATOR_TOKEN"],
          env: {
            VAR0: "zero",
            VAR1: "one",
          },
          ports: {
            "80": 8080,
            "443": 8443,
          },
          volumes: {},
        },
      ],
    };
  }

  async getSecrets() {
    return ["AZ_COORDINATOR_TOKEN", "TLS_PRIVATE_KEY", "ABC_STUFF"];
  }
}

const coordinatorForUser = memo(
  (user: IUser): Coordinator => {
    return new StubCoordinator("");

    // if (user.coordinatorToken) {
    //   return new Coordinator(user.coordinatorToken);
    // } else {
    //   return nullCoordinator;
    // }
  },
  (oldArgs: [IUser], newArgs: [IUser]) => oldArgs[0].id === newArgs[0].id
);

export function Authenticated(props: AuthenticatedProps) {
  const coordinator = coordinatorForUser(props.user);

  return (
    <UserContext.Provider value={props.user}>
      <CoordinatorContext.Provider value={coordinator}>
        <PendingDiff coordinator={coordinator}>
          <div className="row mt-md-5">
            <div className="col-md-2">
              <SideNav />
            </div>
            <div className="col-md-8">
              <Route path="/" component={Dashboard} exact />
              <Route path="/people" component={People} exact />
              <Route path="/people/:name" component={Profile} />
              <Route path="/quotes" component={Quotes} />
              <Route path="/events" component={Events} />
              <Route path="/recent" component={Recent} />
              <Route path="/admin/services" component={Services} exact />
              <Route path="/admin/services/:id" component={ServiceEditor} />
            </div>
          </div>
        </PendingDiff>
      </CoordinatorContext.Provider>
    </UserContext.Provider>
  );
}
