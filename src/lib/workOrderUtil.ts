/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { WorkOrderAttributesDeep } from 'models/operation/workOrder';
import { MqttTopics, sendMqtt } from './mqttUtil';
export type WorkOrderStats = {
  id: number;
  code: string;
  system?: string;
  serial?: string;
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
  const getStats = () => dailyWorkOrderStats;
  const sendStats = () => {
    sendMqtt(MqttTopics.WorkOrderStats, JSON.stringify(getStats()))
  };
  // const updateWorkOrderStats = (params: WorkOrderStats, target: 'Facility' | 'Amr' = 'Facility') => {

  //   if (!dailyWorkOrderStats[target][params.id]) {
  //     dailyWorkOrderStats[target][params.id] = {
  //       id: params.id,
  //       code: params.code,
  //       system: params.system,
  //       totalCreated: 0,
  //       totalCompleted: 0,
  //       averageDuration: 0,
  //       totalDuration: 0,
  //     } as WorkOrderStats;
  //   }
    
  //   dailyWorkOrderStats[target][params.id].totalCreated += 1;
  
  //   if (workOrder.fromStartDate && workOrder.fromEndDate) {
  //     const durationSec = calculateDurationInSeconds(workOrder.fromStartDate, workOrder.fromEndDate);
  //     console.log("🚀 ~ todayWorkOrderList.rows.forEach ~ durationSec:", durationSec);
  //     dailyWorkOrderStats[target][params.id].totalCompleted += 1;
  //     dailyWorkOrderStats[target][params.id].totalDuration += durationSec;
  //     dailyWorkOrderStats[target][params.id].averageDuration = dailyWorkOrderStats[target][params.id].totalDuration / dailyWorkOrderStats[target][facilityKey].totalCompleted;
  //   }
  // };


  return { getStats, sendStats };
};
