import React from "react";

export function Loading() {
  return (
    <div className="row mt-md-5 pushbot-loading">
      <p className="mx-auto">
        <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />
        loading
      </p>
    </div>
  );
}
