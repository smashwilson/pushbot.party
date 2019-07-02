import React from "react";

interface Props {
  query: string;
  onChange: (q: string) => void;
}

export function RemForm(props: Props) {
  function queryChange(evt: React.ChangeEvent<HTMLInputElement>) {
    props.onChange(evt.target.value);
  }

  return (
    <form className="form-inline mt-2 mb-3">
      <div className="input-group">
        <div className="input-group-prepend">
          <div className="input-group-text">containing</div>
        </div>
        <input
          className="form-control"
          type="text"
          value={props.query}
          onChange={queryChange}
        />
      </div>
    </form>
  );
}
