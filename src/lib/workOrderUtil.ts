/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { WorkOrderAttributesDeep, WorkOrderUpdateByCodeParams } from 'models/operation/workOrder';
import { MqttTopics, sendMqtt } from './mqttUtil';
import Facility from 'models/operation/facility';
import Amr from 'models/common/amr';
import { calculateDurationInSeconds } from './dateUtil';
export type WorkOrderStats = {
  id: number;
  code: string;
  system?: string;
  serial?: string;
  name: string;
  totalCreated: number;
  totalCompleted: number;
  averageDuration: number;
  totalDuration: number;
};

export type DailyWorkOrderStats = {
  Facility: Record<number, WorkOrderStats>;
  Amr: Record<number, WorkOrderStats>;
};

const dailyWorkOrderStats: DailyWorkOrderStats = {
  Facility: {},
  Amr: {},
};

export const useWorkOrderStatsUtil = () => {
  const initializeWorkOrderStats = (id: number, code: string, system: string, name: string): WorkOrderStats => ({
    id,
    code,
    system,
    name,
    totalCreated: 0,
    totalCompleted: 0,
    averageDuration: 0,
    totalDuration: 0,
  });
  const getStats = () => dailyWorkOrderStats;
  const setStats = (target: 'Facility' | 'Amr', id: number, code: string, system: string, name: string, params: {created?: number, completed?:number, duration?: number,}) => {
    try{
      if(!dailyWorkOrderStats[target][id]){
        dailyWorkOrderStats[target][id] = initializeWorkOrderStats(id, code, system, name);
  
      }
      const targetObject = dailyWorkOrderStats[target][id]
      if(params.created) targetObject.totalCreated += params.created
      if(params.completed) targetObject.totalCompleted += params.completed
      if(params.duration) {
        targetObject.totalDuration += params.duration
        targetObject.averageDuration = targetObject.totalDuration / targetObject.totalCompleted
      }
      sendStats()
    }catch(error){

    }
 
  }
  const setInitStats = (workOrder: WorkOrderAttributesDeep) => {
    try{
      if(workOrder.FromFacility){
        if(dailyWorkOrderStats.Facility[workOrder.FromFacility.id]){
          dailyWorkOrderStats.Facility[workOrder.FromFacility.id].totalCreated += 1
          if(workOrder.fromStartDate && workOrder.fromEndDate){
            const durationSec = calculateDurationInSeconds(workOrder.fromStartDate, workOrder.fromEndDate)
            dailyWorkOrderStats.Facility[workOrder.FromFacility.id].totalCompleted += 1
            dailyWorkOrderStats.Facility[workOrder.FromFacility.id].totalDuration += durationSec
            dailyWorkOrderStats.Facility[workOrder.FromFacility.id].averageDuration = dailyWorkOrderStats.Facility[workOrder.FromFacility.id].totalDuration / dailyWorkOrderStats.Facility[workOrder.FromFacility.id].totalCompleted
          }
        } else {
          dailyWorkOrderStats.Facility[workOrder.FromFacility.id] = {
            id: workOrder.FromFacility.id,
            code: workOrder.FromFacility.code,
            system: workOrder.FromFacility.system,
            serial: workOrder.FromFacility.serial,
            name: workOrder.FromFacility.name,
            totalCreated: 0,
            totalCompleted: 0,
            averageDuration: 0,
            totalDuration:0.
          } as WorkOrderStats
          dailyWorkOrderStats.Facility[workOrder.FromFacility.id].totalCreated += 1
          if(workOrder.fromStartDate && workOrder.fromEndDate){
            const durationSec = calculateDurationInSeconds(workOrder.fromStartDate, workOrder.fromEndDate)
            dailyWorkOrderStats.Facility[workOrder.FromFacility.id].totalCompleted += 1
            dailyWorkOrderStats.Facility[workOrder.FromFacility.id].totalDuration += durationSec
            dailyWorkOrderStats.Facility[workOrder.FromFacility.id].averageDuration = dailyWorkOrderStats.Facility[workOrder.FromFacility.id].totalDuration / dailyWorkOrderStats.Facility[workOrder.FromFacility.id].totalCompleted
          }
        }
      }
      if(workOrder.toStartDate){
        if(dailyWorkOrderStats.Facility[workOrder.ToFacility.id]){
          dailyWorkOrderStats.Facility[workOrder.ToFacility.id].totalCreated += 1
          if(workOrder.toStartDate && workOrder.toEndDate){
            const durationSec = calculateDurationInSeconds(workOrder.toStartDate, workOrder.toEndDate)
            dailyWorkOrderStats.Facility[workOrder.ToFacility.id].totalCompleted += 1
            dailyWorkOrderStats.Facility[workOrder.ToFacility.id].totalDuration += durationSec
            dailyWorkOrderStats.Facility[workOrder.ToFacility.id].averageDuration = dailyWorkOrderStats.Facility[workOrder.ToFacility.id].totalDuration / dailyWorkOrderStats.Facility[workOrder.ToFacility.id].totalCompleted
          }
        } else {
          dailyWorkOrderStats.Facility[workOrder.ToFacility.id] = {
            id: workOrder.ToFacility.id,
            code: workOrder.ToFacility.code,
            system: workOrder.ToFacility.system,
            serial: workOrder.ToFacility.serial,
            name: workOrder.ToFacility.name,
            totalCreated: 0,
            totalCompleted: 0,
            averageDuration: 0,
            totalDuration:0.
          } as WorkOrderStats
          dailyWorkOrderStats.Facility[workOrder.ToFacility.id].totalCreated += 1
          if(workOrder.toStartDate && workOrder.toEndDate){
            const durationSec = calculateDurationInSeconds(workOrder.toStartDate, workOrder.toEndDate)
            dailyWorkOrderStats.Facility[workOrder.ToFacility.id].totalCompleted += 1
            dailyWorkOrderStats.Facility[workOrder.ToFacility.id].totalDuration += durationSec
            dailyWorkOrderStats.Facility[workOrder.ToFacility.id].averageDuration = dailyWorkOrderStats.Facility[workOrder.ToFacility.id].totalDuration / dailyWorkOrderStats.Facility[workOrder.ToFacility.id].totalCompleted
          }
        }
      }
      if(workOrder.Amr){
        if(dailyWorkOrderStats.Amr[workOrder.Amr.id]){
          dailyWorkOrderStats.Amr[workOrder.Amr.id].totalCreated += 1
          if(workOrder.fromStartDate && workOrder.toEndDate){
            const durationSec = calculateDurationInSeconds(workOrder.fromStartDate, workOrder.toEndDate)
            dailyWorkOrderStats.Amr[workOrder.Amr.id].totalCompleted += 1
            dailyWorkOrderStats.Amr[workOrder.Amr.id].totalDuration += durationSec
            dailyWorkOrderStats.Amr[workOrder.Amr.id].averageDuration = dailyWorkOrderStats.Amr[workOrder.Amr.id].totalDuration / dailyWorkOrderStats.Amr[workOrder.Amr.id].totalCompleted
          }
        } else {
          dailyWorkOrderStats.Amr[workOrder.Amr.id] = {
            id: workOrder.Amr.id,
            code: workOrder.Amr.code,
            name: workOrder.Amr.name,
            totalCreated: 0,
            totalCompleted: 0,
            averageDuration: 0,
            totalDuration:0.
          } as WorkOrderStats
          dailyWorkOrderStats.Amr[workOrder.Amr.id].totalCreated += 1
          if(workOrder.fromStartDate && workOrder.toEndDate){
            const durationSec = calculateDurationInSeconds(workOrder.fromStartDate, workOrder.toEndDate)
            dailyWorkOrderStats.Amr[workOrder.Amr.id].totalCompleted += 1
            dailyWorkOrderStats.Amr[workOrder.Amr.id].totalDuration += durationSec
            dailyWorkOrderStats.Amr[workOrder.Amr.id].averageDuration = dailyWorkOrderStats.Amr[workOrder.Amr.id].totalDuration / dailyWorkOrderStats.Facility[workOrder.Amr.id].totalCompleted
          }
        }
      }
    }catch(error){

    }
    
  }
  const initStats = async () => {
    dailyWorkOrderStats.Facility = {};
    dailyWorkOrderStats.Amr = {};

  }
  const sendStats = () => {
    sendMqtt(MqttTopics.WorkOrderStats, JSON.stringify(getStats()))
  };

  return { getStats, setStats, setInitStats, initStats, sendStats };
};
