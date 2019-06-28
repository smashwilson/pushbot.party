import React, {useState, useContext, useEffect} from "react";
import cx from "classnames";

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
  }

  addInfo(body: React.ReactNode) {
    this.add("info", body);
  }

  addSuccess(body: React.ReactNode) {
    this.add("info", body);
  }

  addSuccessMessage(message: string) {
    this.addSuccess(<p>{message}</p>);
  }

  addDanger(body: React.ReactNode) {
    this.add("info", body);
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
    for (const subscriber of this.subscribers) {
      subscriber(this.notifications);
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
          <button className="btn btn-link float-right" onClick={makeCloser(n)}>
            <i className="fa far fa-window-close" />
          </button>
          {n.body}
        </div>
      ))}
    </div>
  );
}
