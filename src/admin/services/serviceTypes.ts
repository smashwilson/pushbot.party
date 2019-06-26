export interface ServiceType {
  name: string;
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
