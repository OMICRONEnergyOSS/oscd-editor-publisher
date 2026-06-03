import type { Insert, Remove, SetAttributes } from '@openscd/oscd-api';
/** @returns action to update max clients in ReportControl element */
export declare function updateMaxClients(reportControl: Element, max: string | null): Remove | SetAttributes | Insert | null;
