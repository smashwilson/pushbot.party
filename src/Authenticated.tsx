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
import {Rem} from "./rem/Rem";
import {RemEntry} from "./rem/RemEntry";
import {Services} from "./admin/services/Services";
import {ServiceEditor} from "./admin/services/ServiceEditor";
import {Sync} from "./admin/sync/Sync";
import {UserContext, IUser} from "./common/Role";
import {
  CoordinatorContext,
  Coordinator,
  nullCoordinator,
} from "./common/coordinator";
import {PendingDiffProvider} from "./common/PendingDiff";
import {NotificationsProvider, NotificationsView} from "./common/Notifications";

interface AuthenticatedProps {
  user: IUser;
}

const coordinatorForUser = memo(
  (user: IUser): Coordinator => {
    if (user.coordinatorToken) {
      return new Coordinator(user.coordinatorToken);
    } else {
      return nullCoordinator;
    }
  },
  (newArgs: IUser[], lastArgs: IUser[]) => newArgs[0].id === lastArgs[0].id
);

export function Authenticated(props: AuthenticatedProps) {
  const coordinator = coordinatorForUser(props.user);

  return (
    <UserContext.Provider value={props.user}>
      <CoordinatorContext.Provider value={coordinator}>
        <PendingDiffProvider coordinator={coordinator}>
          <NotificationsProvider>
            <div className="row mt-md-5">
              <div className="col-md-2">
                <SideNav />
              </div>
              <div className="col-md-8">
                <NotificationsView />
                <Route path="/" component={Dashboard} exact />
                <Route path="/people" component={People} exact />
                <Route path="/people/:name" component={Profile} />
                <Route path="/quotes" component={Quotes} />
                <Route path="/rem" component={Rem} exact />
                <Route path="/rem/:key" component={RemEntry} />
                <Route path="/events" component={Events} />
                <Route path="/recent" component={Recent} />
                <Route path="/admin/services" component={Services} exact />
                <Route path="/admin/services/:id" component={ServiceEditor} />
                <Route path="/admin/sync" component={Sync} />
              </div>
            </div>
          </NotificationsProvider>
        </PendingDiffProvider>
      </CoordinatorContext.Provider>
    </UserContext.Provider>
  );
}
