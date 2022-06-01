import React, {useState, useContext, useEffect} from "react";
import cx from "classnames";

import {isNetworkError, isGraphQLError} from "./errors";

export type Severity = "info" | "success" | "danger";

interface Notification {
  id: number;
  severity: Severity;
  body: React.ReactNode;
}

class NotificationHub {
  private nextID: number;
  private notifications: Notification[];
  private subscribers: ((ns: Notification[]) => any)[];

  constructor() {
    this.nextID = 0;
    this.notifications = [];
    this.subscribers = [];
  }

  deleteNotification(n: Notification) {
    this.notifications = this.notifications.filter(each => each !== n);
    this.notify();
  }

  addInfo(body: React.ReactNode) {
    this.add("info", body);
  }

  addSuccess(body: React.ReactNode) {
    this.add("success", body);
  }

  addSuccessMessage(message: string) {
    this.addSuccess(<p>{message}</p>);
  }

  addDanger(body: React.ReactNode) {
    this.add("danger", body);
  }

  addError(err: unknown) {
    if (isNetworkError(err)) {
      this.addDanger(
        <>
          <h5>Error: {err.message}</h5>
          <p>
            {err.requestURL} {err.responseStatus}
          </p>
          <pre>{err.responseText}</pre>
        </>
      );
      return;
    }

    if (isGraphQLError(err)) {
      this.addDanger(
        <>
          <h5>Error: {err.message}</h5>
          {err.errors.map((each, i) => (
            <p key={i}>{each}</p>
          ))}
        </>
      );
      return;
    }

    if (err instanceof Error) {
      this.addDanger(
        <>
          <h5>Error: {err.message}</h5>
          <pre className="bg-light px-2 py-1 mt-4">{err.stack}</pre>
        </>
      );
      return;
    }

    this.addDanger(
      <>
        <h5>Error: {err}</h5>
      </>
    )
  }

  onNotification(callback: (ns: Notification[]) => any) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub === callback);
    };
  }

  protected add(severity: Severity, body: React.ReactNode) {
    const id = this.nextID;
    this.nextID++;
    this.notifications.push({id, severity, body});
    this.notify();
  }

  protected notify() {
    const current = [...this.notifications];
    for (const subscriber of this.subscribers) {
      subscriber(current);
    }
  }
}

class DevNull extends NotificationHub {
  protected add() {}

  onNotification() {
    return () => {};
  }
}

const nullHub = new DevNull();

export const NotificationContext = React.createContext<NotificationHub>(
  nullHub
);

export function NotificationsProvider(props: {children: React.ReactNode}) {
  const [hub] = useState(() => new NotificationHub());

  return (
    <NotificationContext.Provider value={hub}>
      {props.children}
    </NotificationContext.Provider>
  );
}

export function NotificationsView() {
  const hub = useContext(NotificationContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => hub.onNotification(setNotifications), [hub]);

  function makeCloser(n: Notification) {
    return function(evt: React.MouseEvent<HTMLButtonElement>) {
      evt.preventDefault();
      hub.deleteNotification(n);
    };
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="px-2 mt-2 mb-3">
      {notifications.map(n => (
        <div key={n.id} className={cx("alert", `alert-${n.severity}`, "my-2")}>
          <button className="close" onClick={makeCloser(n)}>
            <i className="fa far fa-window-close" />
          </button>
          {n.body}
        </div>
      ))}
    </div>
  );
}
