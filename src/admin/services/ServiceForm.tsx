import React, {useState, useMemo, useContext} from "react";
import {Link, Redirect} from "react-router-dom";
import cx from "classnames";

import {
  IDesiredUnit,
  IDesiredUnitCreate,
  IDesiredUnitUpdate,
  IContainer,
  ISecretsCreate,
  CoordinatorContext,
} from "../../common/coordinator";
import {serviceTypes, getServiceType} from "./serviceTypes";
import {EnvVarListEditor} from "./EnvVarListEditor";
import {SecretListEditor} from "./SecretListEditor";
import {VolumeListEditor} from "./VolumeListEditor";
import {PortListEditor} from "./PortListEditor";

function withContainer<D>(
  unit: IDesiredUnit,
  present: (container: IContainer) => D,
  absent: () => D
): D {
  if (!unit.container) {
    return absent();
  }

  return present(unit.container);
}

interface ServiceFormProps {
  mode: "create" | "update";
  original: IDesiredUnit;
  knownSecrets: string[];
}

export function ServiceForm({mode, original, knownSecrets}: ServiceFormProps) {
  const [nextRoute, setNextRoute] = useState<string | null>(null);

  const [currentPath, setPath] = useState(original.path);
  const [currentType, setType] = useState(getServiceType(original.type));
  const [currentContainerName, setContainerName] = useState(
    withContainer(original, c => c.name || "", () => "")
  );
  const [currentContainerImageName, setContainerImageName] = useState(
    withContainer(original, c => c.image_name, () => "quay.io/smashwilson/az-")
  );
  const [currentContainerImageTag, setContainerImageTag] = useState(
    withContainer(original, c => c.image_tag, () => "latest")
  );
  const [currentEnvVars, setEnvVars] = useState(original.env);
  const [currentSecrets, setSecrets] = useState(original.secrets);
  const [currentVolumes, setVolumes] = useState(original.volumes);
  const [currentPorts, setPorts] = useState(original.ports);
  const [currentSchedule, setSchedule] = useState(original.schedule);

  const [createdSecrets, setCreatedSecrets] = useState<ISecretsCreate>({});

  function deleteSecret(name: string) {
    setSecrets(currentSecrets.filter(each => each !== name));
  }

  function addSecret(name: string) {
    setSecrets([...currentSecrets, name]);
  }

  function createSecret(name: string, value: string) {
    setSecrets([...currentSecrets, name]);
    setCreatedSecrets({...createdSecrets, [name]: value});
  }

  function deleteVolume(hostPath: string) {
    const nextVolumes = {...currentVolumes};
    delete nextVolumes[hostPath];
    setVolumes(nextVolumes);
  }

  function createVolume(hostPath: string, containerPath: string) {
    setVolumes({
      ...currentVolumes,
      [hostPath]: containerPath,
    });
  }

  function deletePort(hostPort: string) {
    const nextPorts = {...currentPorts};
    delete nextPorts[hostPort];
    setPorts(nextPorts);
  }

  function createPort(hostPort: string, containerPort: number) {
    setPorts({
      ...currentPorts,
      [hostPort]: containerPort,
    });
  }

  const availableSecrets = useMemo(() => {
    const used = new Set(currentSecrets);
    return knownSecrets.filter(each => !used.has(each));
  }, [knownSecrets, currentSecrets]);

  const coordinator = useContext(CoordinatorContext);

  if (nextRoute) {
    return <Redirect to={nextRoute} />;
  }

  async function apply(evt: React.MouseEvent<HTMLButtonElement>) {
    evt.preventDefault();
    const common: IDesiredUnitCreate | IDesiredUnitUpdate = {
      type: currentType.name as "simple" | "oneshot" | "timer" | "self",
      secrets: currentType.ifEnvAndSecrets(() => currentSecrets) || [],
      env: currentType.ifEnvAndSecrets(() => currentEnvVars) || {},
      ports: currentType.ifPorts(() => currentPorts) || {},
      volumes: currentType.ifVolumes(() => currentVolumes) || {},
      schedule: currentType.ifSchedule(() => currentSchedule) || "",
    };

    currentType.ifAnyContainer(() => {
      common.container = {
        name: currentType.ifContainerName(() => currentContainerName) || "",
        image_name: currentContainerImageName,
        image_tag: currentContainerImageTag,
      };
    });

    if (Object.keys(createdSecrets).length > 0) {
      await coordinator.createSecrets(createdSecrets);
    }

    if (mode === "create") {
      const payload: IDesiredUnitCreate = {
        path: currentPath,
        ...common,
      };
      const created = await coordinator.createDesiredUnit(payload);
      setNextRoute(
        `/admin/services/${encodeURIComponent(created.id.toString())}`
      );
    } else {
      const payload: IDesiredUnitUpdate = common;
      await coordinator.updateDesiredUnit(original.id, payload);
      setNextRoute("/admin/services");
    }
  }

  return (
    <form className="border rounded p-3">
      {/* path */}
      <div className="form-row">
        <label htmlFor="serviceEditor--path" className="col-sm-3">
          Path:
        </label>
        <div className={cx("col-sm-9", {disabled: mode === "update"})}>
          <input
            id="serviceEditor--path"
            className="form-control text-monospace"
            type="text"
            value={currentPath}
            onChange={evt => setPath(evt.target.value)}
            readOnly={mode === "update"}
          />
        </div>
      </div>

      {/* type */}
      <div className="form-row">
        <label htmlFor="serviceEditor--type" className="col-sm-3">
          Type:
        </label>
        <div className="col-sm-2">
          <select
            className="form-control"
            id="serviceEditor--type"
            onChange={evt => setType(getServiceType(evt.target.value))}
          >
            {serviceTypes.map(tp => (
              <option selected={tp === currentType} value={tp.name}>
                {tp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* invalid type detection */}
      {currentType.ifInvalid(() => (
        <div className="form-row my-2">
          <div className="alert alert-danger px-3 col">
            <p>
              Invalid service type:{" "}
              <span className="font-weight-bold">{currentType.name}</span>.
            </p>
            <p>Please choose another.</p>
          </div>
        </div>
      ))}

      <hr />

      {currentType.ifAnyContainer(() => (
        <div className="form-row mt-4 mb-2">
          <div className="col">
            <h6 className="text-secondary">Container details</h6>
          </div>
        </div>
      ))}

      {/* container name */}
      {currentType.ifContainerName(() => (
        <div className="form-row">
          <label htmlFor="serviceEditor--containerName" className="col-sm-3">
            Name:
          </label>
          <div className="col-sm-9">
            <input
              id="serviceEditor--containerName"
              className="form-control"
              type="text"
              value={currentContainerName}
              onChange={evt => setContainerName(evt.target.value)}
            />
          </div>
        </div>
      ))}

      {/* container image name and tag */}
      {currentType.ifContainerConfig(() => (
        <div className="form-row">
          <label
            htmlFor="serviceEditor--containerImageName"
            className="col-sm-3"
          >
            Image:
          </label>
          <div className="col-sm-5">
            <input
              id="serviceEditor--containerImageName"
              className="form-control"
              type="text"
              value={currentContainerImageName}
              onChange={evt => setContainerImageName(evt.target.value)}
              placeholder="quay.io/smashwilson/az-"
            />
          </div>
          <div className="col-sm-3">
            <input
              id="serviceEditor--containerImageTag"
              className="form-control"
              type="text"
              value={currentContainerImageTag}
              onChange={evt => setContainerImageTag(evt.target.value)}
              placeholder="latest"
            />
          </div>
        </div>
      ))}

      {/* environment variables and secrets */}
      {currentType.ifEnvAndSecrets(() => (
        <>
          <div className="form-row mt-4 mb-2">
            <div className="col">
              <h6 className="text-secondary">Environment variables</h6>
            </div>
          </div>
          <EnvVarListEditor
            envVars={currentEnvVars}
            onChange={(name, value) => {
              const nextVars = {
                ...currentEnvVars,
                [name]: value,
              };
              setEnvVars(nextVars);
            }}
            onDelete={name => {
              const nextVars = {...currentEnvVars};
              delete nextVars[name];
              setEnvVars(nextVars);
            }}
          />
          <div className="form-row mt-4 mb-2">
            <div className="col">
              <h6 className="text-secondary">Secrets</h6>
            </div>
          </div>
          <SecretListEditor
            availableSecrets={availableSecrets}
            secrets={currentSecrets}
            onDelete={deleteSecret}
            onAdd={addSecret}
            onCreate={createSecret}
          />
        </>
      ))}

      {/* volumes */}
      {currentType.ifVolumes(() => (
        <>
          <div className="form-row mt-4 mb-2">
            <div className="col">
              <h6 className="text-secondary">Volumes</h6>
            </div>
          </div>
          <VolumeListEditor
            volumeMap={currentVolumes}
            onCreate={createVolume}
            onDelete={deleteVolume}
          />
        </>
      ))}

      {/* port mappings */}
      {currentType.ifPorts(() => (
        <>
          <div className="form-row mt-4 mb-2">
            <div className="col">
              <h6 className="text-secondary">Port mappings</h6>
            </div>
          </div>
          <PortListEditor
            portMap={currentPorts}
            onCreate={createPort}
            onDelete={deletePort}
          />
        </>
      ))}

      {/* schedule */}
      {currentType.ifSchedule(() => (
        <div className="form-row">
          <label htmlFor="serviceEditor--schedule" className="col-sm-3">
            Schedule:
          </label>
          <div className="col-sm-7">
            <input
              id="serviceEditor--schedule"
              className="form-control"
              type="text"
              value={currentSchedule}
              onChange={evt => setSchedule(evt.target.value)}
            />
          </div>
          <div className="col-sm-2">
            <a
              target="_new"
              href="https://www.freedesktop.org/software/systemd/man/systemd.time.html#"
            >
              <i className="fas fa-book mr-2" />
              reference
            </a>
          </div>
        </div>
      ))}

      <hr />

      {/* controls */}
      <div className="form-row d-flex align-items-baseline justify-content-end m-3">
        <div className="btn-group">
          <Link to="/admin/services" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" onClick={apply}>
            {mode === "create" ? "Create" : "Update"}
          </button>
        </div>
      </div>
    </form>
  );
}
