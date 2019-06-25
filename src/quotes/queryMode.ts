export interface QueryModeCases<R> {
  containing?(): R;
  by?(): R;
  about?(): R;
  default?(): R;
}

export interface QueryMode {
  when<R>(cases: QueryModeCases<R>): R | null;
  label: string;
}

export const CONTAINING: QueryMode = {
  when<R>(cases: QueryModeCases<R>): R | null {
    return (cases.containing || cases.default || (() => null))();
  },

  label: "containing",
};

export const BY: QueryMode = {
  when<R>(cases: QueryModeCases<R>): R | null {
    return (cases.by || cases.default || (() => null))();
  },

  label: "by",
};

export const ABOUT: QueryMode = {
  when<R>(cases: QueryModeCases<R>): R | null {
    return (cases.about || cases.default || (() => null))();
  },

  label: "about",
};

export const modes: QueryMode[] = [CONTAINING, BY, ABOUT];
