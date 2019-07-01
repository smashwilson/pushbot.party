import {useState} from "react";

import {
  ServiceType as ValidServiceType,
  IDesiredUnit,
  IDesiredUnitUpdate,
  IDesiredUnitCreate,
  IEnvMap,
  IPortMap,
  IVolumeMap,
  IContainer,
} from "../../common/coordinator";

export interface ServiceType {
  name: string;

  valid: boolean;
  hasAnyContainer: boolean;
  hasContainerConfig: boolean;
  hasContainerName: boolean;
  hasEnvAndSecrets: boolean;
  hasVolumes: boolean;
  hasPorts: boolean;
  hasSchedule: boolean;

  ifInvalid<R>(cb: () => R): R | null;
  ifAnyContainer<R>(cb: () => R): R | null;
  ifContainerConfig<R>(cb: () => R): R | null;
  ifContainerName<R>(cb: () => R): R | null;
  ifEnvAndSecrets<R>(cb: () => R): R | null;
  ifVolumes<R>(cb: () => R): R | null;
  ifPorts<R>(cb: () => R): R | null;
  ifSchedule<R>(cb: () => R): R | null;
}

interface Spec {
  isInvalid?: boolean;
  hasContainerConfig?: boolean;
  hasContainerName?: boolean;
  hasEnvAndSecrets?: boolean;
  hasVolumes?: boolean;
  hasPorts?: boolean;
  hasSchedule?: boolean;
}

const typeMap: Map<string, ServiceType> = new Map();

function makeServiceType(typeName: string, config: Spec): ServiceType {
  function accept<R>(cb: () => R): R {
    return cb();
  }

  function skip() {
    return null;
  }

  const serviceType = {
    name: typeName,

    valid: !config.isInvalid,
    hasAnyContainer: Boolean(
      config.hasContainerName || config.hasContainerConfig
    ),
    hasContainerConfig: Boolean(config.hasContainerConfig),
    hasContainerName: Boolean(config.hasContainerName),
    hasEnvAndSecrets: Boolean(config.hasEnvAndSecrets),
    hasVolumes: Boolean(config.hasVolumes),
    hasPorts: Boolean(config.hasPorts),
    hasSchedule: Boolean(config.hasSchedule),

    ifInvalid: config.isInvalid ? accept : skip,
    ifAnyContainer:
      config.hasContainerName || config.hasContainerConfig ? accept : skip,
    ifContainerConfig: config.hasContainerConfig ? accept : skip,
    ifContainerName: config.hasContainerName ? accept : skip,
    ifEnvAndSecrets: config.hasEnvAndSecrets ? accept : skip,
    ifVolumes: config.hasVolumes ? accept : skip,
    ifPorts: config.hasPorts ? accept : skip,
    ifSchedule: config.hasSchedule ? accept : skip,
  };

  if (!config.isInvalid) {
    typeMap.set(typeName, serviceType);
  }
  return serviceType;
}

export const typeSimple = makeServiceType("simple", {
  hasContainerConfig: true,
  hasContainerName: true,
  hasEnvAndSecrets: true,
  hasVolumes: true,
  hasPorts: true,
});

export const typeOneShot = makeServiceType("oneshot", {
  hasContainerConfig: true,
  hasEnvAndSecrets: true,
  hasVolumes: true,
  hasPorts: true,
});

export const typeTimer = makeServiceType("timer", {
  hasSchedule: true,
});

export const typeSelf = makeServiceType("self", {
  hasEnvAndSecrets: true,
});

export const serviceTypes = [typeSimple, typeOneShot, typeTimer, typeSelf];

export function getServiceType(typeName: string): ServiceType {
  return typeMap.get(typeName) || makeServiceType(typeName, {isInvalid: true});
}

export type UnitAction = "create" | "update";

export class DesiredUnitPayload {
  private original?: IDesiredUnit;
  path: string;
  currentType: ServiceType;
  secrets: string[];
  env: IEnvMap;
  ports: IPortMap;
  volumes: IVolumeMap;
  containerName: string;
  containerImageName: string;
  containerImageTag: string;
  calendar: string;

  constructor(original?: IDesiredUnit) {
    this.original = original;
    this.path = original ? original.path : "/etc/systemd/system/az-";
    this.currentType = original ? getServiceType(original.type) : typeSimple;
    this.secrets = original ? [...original.secrets] : [];
    this.env = original ? {...original.env} : {};
    this.ports = original ? {...original.ports} : {};
    this.volumes = original ? {...original.volumes} : {};
    this.containerName =
      (original && original.container && original.container.name) || "";
    this.containerImageName =
      (original && original.container && original.container.image_name) ||
      "quay.io/smashwilson/az-";
    this.containerImageTag =
      (original && original.container && original.container.image_tag) ||
      "latest";

    this.calendar =
      original && original.calendar ? original.calendar : "*-*-* 00:00:00";
  }

  private get type(): ValidServiceType {
    return this.currentType.name as ValidServiceType;
  }

  private commonValidation(): boolean {
    function isEmpty(s: string): boolean {
      return s.length === 0;
    }

    function hasEmptyKeyOrValue(obj: {[k: string]: string}): boolean {
      const ks = Object.keys(obj);
      return ks.some(k => isEmpty(k) || isEmpty(obj[k]));
    }

    if (!this.currentType.valid) {
      return false;
    }

    if (this.currentType.hasContainerName && isEmpty(this.containerName)) {
      return false;
    }

    if (this.currentType.hasContainerConfig) {
      if (isEmpty(this.containerImageName)) {
        return false;
      }

      if (isEmpty(this.containerImageTag)) {
        return false;
      }
    }

    if (this.currentType.hasEnvAndSecrets) {
      if (hasEmptyKeyOrValue(this.env)) {
        return false;
      }

      if (this.secrets.some(isEmpty)) {
        return false;
      }
    }

    if (this.currentType.hasPorts) {
      function isInvalidPortNumber(p: number): boolean {
        return isNaN(p) || p < 0 || p > 65536;
      }

      function isInvalidPort(s: string): boolean {
        const parsed = parseInt(s, 10);
        return isInvalidPortNumber(parsed);
      }

      const hostPorts = Object.keys(this.ports);
      if (hostPorts.some(isInvalidPort)) {
        return false;
      }

      if (hostPorts.some(hp => isInvalidPortNumber(this.ports[hp]))) {
        return false;
      }
    }

    if (this.currentType.hasVolumes) {
      if (hasEmptyKeyOrValue(this.volumes)) {
        return false;
      }
    }

    if (this.currentType.hasSchedule) {
      if (isEmpty(this.calendar)) {
        return false;
      }
    }

    return true;
  }

  isCreate() {
    return this.original === undefined;
  }

  isUpdate() {
    return this.original !== undefined;
  }

  withAction<R>(cbs: {create: () => R; update: (id: number) => R}): R {
    if (this.original) {
      return cbs.update(this.original.id);
    } else {
      return cbs.create();
    }
  }

  isModified(): boolean {
    if (!this.original) {
      return true;
    }

    if (this.currentType.name !== this.original.type) {
      return true;
    }

    if (this.currentType.hasAnyContainer) {
      if (!this.original.container) {
        return true;
      }

      const container = this.original.container;

      if (
        this.currentType.hasContainerName &&
        container.name !== this.containerName
      ) {
        return true;
      }

      if (container.image_name !== this.containerImageName) {
        return true;
      }

      if (container.image_tag !== this.containerImageTag) {
        return true;
      }
    }

    function arrayChanged<K>(array: K[], original: K[]): boolean {
      if (array.length !== original.length) {
        return true;
      }

      const s = new Set(array);
      return original.some(o => !s.has(o));
    }

    function objectChanged<K>(
      obj: {[k: string]: K},
      original: {[k: string]: K}
    ): boolean {
      const ks = Object.keys(obj);
      return (
        arrayChanged(ks, Object.keys(original)) &&
        ks.some(k => obj[k] !== original[k])
      );
    }

    if (this.currentType.hasEnvAndSecrets) {
      if (arrayChanged(this.secrets, this.original.secrets)) {
        return true;
      }

      if (objectChanged(this.env, this.original.env)) {
        return true;
      }
    }

    if (
      this.currentType.hasPorts &&
      objectChanged(this.ports, this.original.ports)
    ) {
      return true;
    }

    if (
      this.currentType.hasVolumes &&
      objectChanged(this.volumes, this.original.volumes)
    ) {
      return true;
    }

    if (
      this.currentType.hasSchedule &&
      this.calendar !== this.original.calendar
    ) {
      return true;
    }

    return false;
  }

  isValid(): boolean {
    if (!this.commonValidation()) {
      return false;
    }

    return this.withAction({
      create: () => this.path.length !== 0,
      update: () => this.isModified(),
    });
  }

  private getCommonPayload(): IDesiredUnitCreate | IDesiredUnitUpdate {
    const payload: IDesiredUnitCreate | IDesiredUnitUpdate = {
      type: this.type,
      secrets: [],
      env: {},
      ports: {},
      volumes: {},
    };

    if (this.currentType.hasContainerConfig) {
      const container: IContainer = {
        image_name: this.containerImageName,
        image_tag: this.containerImageTag,
      };
      if (this.currentType.hasContainerName) {
        container.name = this.containerName;
      }
      payload.container = container;
    }

    if (this.currentType.hasEnvAndSecrets) {
      payload.env = this.env;
      payload.secrets = this.secrets;
    }

    if (this.currentType.hasPorts) {
      payload.ports = this.ports;
    }

    if (this.currentType.hasVolumes) {
      payload.volumes = this.volumes;
    }

    if (this.currentType.hasSchedule) {
      payload.calendar = this.calendar;
    }

    return payload;
  }

  withID<R>(fn: (id: number) => R): R | null {
    if (this.original) {
      return fn(this.original.id);
    }

    return null;
  }

  getCreatePayload(): IDesiredUnitCreate {
    return {
      ...this.getCommonPayload(),
      path: this.path,
    };
  }

  getUpdatePayload(): IDesiredUnitUpdate {
    return this.getCommonPayload();
  }
}

export function usePayloadState<K extends keyof DesiredUnitPayload>(
  payload: DesiredUnitPayload,
  key: K
): [DesiredUnitPayload[K], (v: DesiredUnitPayload[K]) => void] {
  const [value, setValue] = useState<DesiredUnitPayload[K]>(payload[key]);

  function setInPayload(v: DesiredUnitPayload[K]): void {
    payload[key] = v;
    setValue(v);
  }

  return [value, setInPayload];
}
