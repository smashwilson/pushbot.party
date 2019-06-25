import {IChange, ILine, IDisposable, ALL} from "./queryTypes";

export class Selection {
  public isSelecting: boolean;
  private ids: Set<string>;
  private subs: ((arg: IChange) => any)[];

  constructor() {
    this.ids = new Set();
    this.isSelecting = false;
    this.subs = [];
  }

  onDidChange(cb: (arg: IChange) => any): IDisposable {
    this.subs.push(cb);
    return {
      dispose: () => {
        const index = this.subs.indexOf(cb);
        this.subs.splice(index, 1);
      },
    };
  }

  didChange(payload: IChange) {
    for (const sub of this.subs) {
      sub(payload);
    }
  }

  isSelected(line: ILine): boolean {
    return this.ids.has(line.id!);
  }

  select(line: ILine): boolean {
    const wasSelected = this.ids.has(line.id!);
    this.ids.add(line.id!);
    if (!wasSelected) this.didChange(line);
    return !wasSelected;
  }

  startSelecting() {
    this.isSelecting = true;
  }

  stopSelecting() {
    this.isSelecting = false;
  }

  toggle(line: ILine) {
    if (!this.ids.delete(line.id!)) {
      this.ids.add(line.id!);
    }
    this.didChange(line);
  }

  clear() {
    this.ids.clear();
    this.didChange(ALL);
  }

  getLineIDs(): string[] {
    return Array.from(this.ids);
  }

  isEmpty(): boolean {
    return this.ids.size === 0;
  }

  describe(): string {
    if (this.ids.size === 0) {
      return "nothing selected";
    } else if (this.ids.size === 1) {
      return "1 line selected";
    } else {
      return `${this.ids.size} lines selected`;
    }
  }
}
