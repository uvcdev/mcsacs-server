/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { FacilityAttributesDeep } from '../models/operation/facility';
import { RequestLog, logging, makeLogFormat } from './logging';
import { RedisKeys, RedisSettingKeys, useRedisUtil } from './redisUtil';
// import { ChargerAttributesDeep } from 'models/common/chargerModel';
// import { useWsUtil } from './websocketUtil';
// import { TaskTypes } from './fmsCheckUtil';
// import { chargeHistoryService } from '../service/common/chargeHistoryService';
// import { ChargeHistoryInsertParams } from 'models/common/chargeHistoryModel';
// import { useChargerUtil } from './chargerUtil';
// import alarmService from '../service/common/alarmService';
// import { AlarmAttributes } from '../models/common/alarm';
// import { WorkOrderAttributes, WorkOrderAttributesDeep } from 'models/operation/workOrder';
// import { FacilitySetting, AssignmentPriorirySetting, PriorityType } from '../models/operation/setting';
// import { OrderAttributes, OrderTypes } from '../models/common/order';
// import { workOrderService } from '../service/operation/workOrderService';
// import { FacilityGroupAttributes, FacilityGroupAttributesDeep } from '../models/common/facilityGroupModel';

export type FacilityStatusType = {
  uuid: string;
  name: string;
  status: 'idle' | 'busy' | 'idle_on_hold';
  status_toggle: any[]; // 더 구체적인 타입 정보가 필요할 수 있음
  type_specific: {
    robot_info: {
      width: number;
      length: number;
      size_center_to_front: number;
      size_center_to_rear: number;
      size_center_to_left: number;
      size_center_to_right: number;
      model: string;
    };
    battery: {
      battery_level: number;
      now_charging: boolean;
      charge_source: string;
    };
    location: {
      map: string;
      pose2d: {
        x: number;
        y: number;
        theta: number;
      };
      semantic_location: any; // 구체적인 타입 정보가 필요할 수 있음
      romo_state: string;
      path_plan: any; // 구체적인 타입 정보가 필요할 수 있음
      odometry: {
        orient_w: number;
        orient_x: number;
        orient_y: number;
        orient_z: number;
        position_x: number;
        position_y: number;
        position_z: number;
        velo_dx: number;
        velo_dy: number;
        velo_dz: number;
      };
    };
    ip: string;
    target_fms_ip: string;
    dynamic_footprint: any; // 구체적인 타입 정보가 필요할 수 있음
    home_station: {
      name: string;
      id: string | null;
    };
    payload: 'unknwon' | 'true' | 'false';
    mileage: number;
    running_time: string;
  };
  status_p: string;
  id: string;
};

export type Point = {
  x: number;
  y: number;
};

export const StatusToggleAlarmList = ['error', 'emergency_button'];

// export const useFacilityUtil = () => {
//   const redisUtil = useRedisUtil();
//   let isAssignTaskProgress = false;
//   const sortedWorkOrderPrioiry = (workOrderList: WorkOrderAttributesDeep[]): WorkOrderAttributesDeep[] =>
//     workOrderList.sort((a, b) => {
//       if (a.level !== b.level) {
//         return (b.level || 0) - (a.level || 0);
//       }
//       return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
//     });
//   const findUsageFacilitysSortedByBatteryDesc = (facilityInfoList: FacilityAttributesDeep[]): FacilityAttributesDeep[] => {
//     const result = facilityInfoList
//       .filter((facilityInfo) => facilityInfo.RealTime?.status === 'idle')
//       .sort(
//         (a, b) =>
//           (b.RealTime?.type_specific.battery.battery_level || 0) -
//           (a.RealTime?.type_specific.battery.battery_level || 0)
//       );

//     return result;
//   };
//   const filterFacilitysByGroupRate = async (facilityInfoList: FacilityAttributesDeep[]): Promise<FacilityAttributesDeep[]> => {
//     const facilityGroupStatus = {} as Record<
//       string,
//       { facilityGroupData: FacilityGroupAttributes; idle: FacilityAttributesDeep[]; busy: FacilityAttributesDeep[] }
//     >;
//     const availableFacilitys = [] as FacilityAttributesDeep[];

//     for (let i = 0, length = facilityInfoList.length; i < length; i++) {
//       const facilityInfo = facilityInfoList[i];
//       const facilityGroupId = facilityInfo.facilityGroupId || null;
//       if (!facilityGroupId) {
//         availableFacilitys.push(facilityInfo);
//         continue;
//       }
//       if (!facilityGroupStatus[facilityGroupId]) {
//         const facilityGroup = await redisUtil.hgetObject<FacilityGroupAttributes>(
//           RedisKeys.InfoFacilityGroupById,
//           facilityGroupId.toString()
//         );
//         if (!facilityGroup) continue;
//         facilityGroupStatus[facilityGroupId] = {
//           facilityGroupData: facilityGroup,
//           idle: [],
//           busy: [],
//         };
//       }
//       const facilityGroupState = facilityGroupStatus[facilityGroupId];
//       if (facilityInfo.RealTime?.status === 'idle') {
//         facilityGroupState['idle'].push(facilityInfo);
//       } else if (facilityInfo.RealTime?.status === 'busy' || facilityInfo.RealTime?.status === 'idle_on_hold') {
//         facilityGroupState['busy'].push(facilityInfo);
//       }
//     }
//     for (const [key, value] of Object.entries(facilityGroupStatus)) {
//       const { facilityGroupData, idle, busy } = value;
//       const loadRate = facilityGroupData.loadRate || 100;
//       const idleCount = idle.length;
//       const busyCount = busy.length;
//       const totalCount = idleCount + busyCount;
//       const currentRate = (busyCount * 100) / totalCount;

//       if (loadRate > (busyCount * 100) / totalCount) {
//         availableFacilitys.push(...idle);
//         // console.log(
//         //   `(사용가능)${facilityGroupData.name}의 부하율:${loadRate}%, 현재 부하율: ${currentRate.toFixed(
//         //     2
//         //   )}, idle:${idleCount}개, busy:${busyCount}개`
//         // );
//       } else {
//         // console.log(
//         //   `(사용불가능)${facilityGroupData.name}의 부하율:${loadRate}%, 현재 부하율: ${currentRate.toFixed(
//         //     2
//         //   )}, idle:${idleCount}개, busy:${busyCount}개`
//         // );
//       }
//     }

//     return availableFacilitys;
//   };
//   const calculateDistance = (point1: Point, point2: Point): number => {
//     const xDiff = point1.x - point2.x;
//     const yDiff = point1.y - point2.y;
//     return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
//   };
//   const evaluateBattery = (facilityInfoList: FacilityAttributesDeep[]): FacilityAttributesDeep[] => {
//     if (facilityInfoList.length === 0) {
//       return [];
//     }
//     const firstFacility = facilityInfoList[0];
//     const duplicates = [firstFacility];

//     for (let i = 1, length = facilityInfoList.length; i < length; i++) {
//       const targetFacilityInfo = facilityInfoList[i];
//       if (
//         targetFacilityInfo.RealTime?.type_specific.battery.battery_level ===
//         firstFacility.RealTime?.type_specific.battery.battery_level
//       ) {
//         duplicates.push(targetFacilityInfo);
//       } else {
//         break;
//       }
//     }
//     return duplicates;
//   };
//   const evaluateConditions = {
//     batteryLevel: (facilityInfoList: FacilityAttributesDeep[]) => evaluateBattery(facilityInfoList),
//     distance: (facilityInfoList: FacilityAttributesDeep[], workOrder: WorkOrderAttributesDeep): FacilityAttributesDeep | null => {
//       const MAX_DISTANCE = 999999;
//       if (!workOrder.FromFacility.Location?.data?.pose) return null;
//       const workOrderPoint = {
//         x: Number(workOrder.FromFacility.Location.data.pose.x),
//         y: Number(workOrder.FromFacility.Location.data.pose.y),
//       };
//       //facilityInfoList포문, 거리계산, 제일빠른거 리턴
//       const sortedFacilityListByDistance = facilityInfoList
//         .map((facilityInfo) => {
//           const distance = facilityInfo.RealTime
//             ? calculateDistance(facilityInfo.RealTime.type_specific.location.pose2d, workOrderPoint)
//             : MAX_DISTANCE; // RealTime 정보가 없는 경우, 최대 거리로 설정
//           return {
//             ...facilityInfo,
//             distance,
//           };
//         })
//         .sort((a, b) => a.distance - b.distance);

//       // 정렬된 리스트의 첫 번째 요소가 최대 거리인지 확인하고, 그렇다면 null을 리턴
//       return sortedFacilityListByDistance.length > 0 && sortedFacilityListByDistance[0].distance !== MAX_DISTANCE
//         ? sortedFacilityListByDistance[0]
//         : null;
//     },
//   };
//   const assignOptimalAMR = async (
//     workOrderList: WorkOrderAttributesDeep[],
//     facilityList: FacilityAttributesDeep[],
//     assignmentPriorityList: PriorityType[]
//   ) => {
//     const wsUtil = useWsUtil();
//     for (let i = 0, length = workOrderList.length; i < length; i++) {
//       const workOrder = workOrderList[i];
//       if (workOrder.state !== 'registered') {
//         continue;
//       }
//       const fromFacilityId = workOrder.fromFacilityId;
//       const toFacilityId = workOrder.toFacilityId;
//       const fromFacilityOrders = await redisUtil.hgetObject<OrderAttributes[]>(
//         RedisKeys.OrdersByFacilityId,
//         fromFacilityId?.toString() || ''
//       );
//       if (!fromFacilityOrders) {
//         logging.ACTION_ERROR({
//           filename: 'facilityUtil.ts.assignOptimalAMR',
//           error: `redis에 ${RedisKeys.OrdersByFacilityId}, fromtFacility:${fromFacilityId?.toString() || ''
//             } 데이터가 없습니다.`,
//           params: null,
//           result: false,
//         });
//         continue;
//       }
//       const toFacilityOrders = await redisUtil.hgetObject<OrderAttributes[]>(
//         RedisKeys.OrdersByFacilityId,
//         toFacilityId?.toString() || ''
//       );
//       if (!toFacilityOrders) {
//         logging.ACTION_ERROR({
//           filename: 'facilityUtil.ts.assignOptimalAMR',
//           error: `redis에 ${RedisKeys.OrdersByFacilityId}, toFacility:${toFacilityId?.toString() || ''
//             } 데이터가 없습니다.`,
//           params: null,
//           result: false,
//         });
//         continue;
//       }
//       let selectedAMR = null;
//       let optimalAMRList = null;
//       // assignmentPriorityList에 따라 조건별로 AMR 평가
//       for (const priority of assignmentPriorityList) {
//         if (priority === 'batteryLevel') {
//           optimalAMRList = evaluateConditions['batteryLevel'](optimalAMRList || facilityList);
//           console.log('🚀 ~ useFacilityUtil ~ optimalAMRList:', optimalAMRList);
//           if (optimalAMRList.length === 1) {
//             selectedAMR = optimalAMRList[0];
//             break;
//           }
//         }
//         if (priority === 'distance') {
//           //배터리 우선을 먼저해서 리스트가 잇으면 그걸기준으로 할것
//           selectedAMR = evaluateConditions['distance'](optimalAMRList || facilityList, workOrder);
//         }
//         if (selectedAMR) break; // 조건을 만족하는 AMR을 찾으면 반복 중단
//       }

//       console.log('🚀 ~ useFacilityUtil ~ selectedAMR:', selectedAMR);
//       if (selectedAMR) {
//         // TODO: 작업할당시 facility 도킹여부에 따른 처리 할 것
//         // TODO: 도킹여부 판단 데이터 들어오면 로직 추가할 것
//         // 도킹중인걸 어떻게 암?????
//         // 오더를 찾을때는 이미 해당위치에 도킹중인경우 도킹중 작업으로 할당할 필요가 있음
//         const fromOrder = fromFacilityOrders?.find((order) => order.type === OrderTypes.FetchBeforeDocking); //여기
//         const toOrder = toFacilityOrders?.find((order) => (order.type = OrderTypes.DeliverItem));
//         if (!fromOrder?.data) {
//           logging.ACTION_ERROR({
//             filename: 'facilityUtil.ts.assignOptimalAMR',
//             error: `fromOrder.data 데이터가 없습니다.`,
//             params: null,
//             result: false,
//           });
//           continue;
//         }
//         if (!toOrder?.data) {
//           logging.ACTION_ERROR({
//             filename: 'facilityUtil.ts.assignOptimalAMR',
//             error: `toOrder.data 데이터가 없습니다.`,
//             params: null,
//             result: false,
//           });
//           continue;
//         }
//         wsUtil.setJob('fromAutoJob', { id: selectedAMR.id, code: selectedAMR.code }, fromOrder?.data, 'auto', {
//           workOrderId: workOrder.id,
//           orderId: fromOrder?.id,
//           userId: null,
//           description: '',
//         });

//         const data = [
//           {
//             title: 'fromAutoJob',
//             facilityId: selectedAMR.id,
//             facilityCode: selectedAMR.code,
//             data: fromOrder.data,
//             mode: 'auto',
//             etc: {
//               workOrderId: workOrder.id,
//               orderId: fromOrder?.id,
//               userId: null,
//               description: '',
//             },
//           },
//           {
//             title: 'toAutoJob',
//             facilityId: selectedAMR.id,
//             facilityCode: selectedAMR.code,
//             data: toOrder.data,
//             mode: 'auto',
//             etc: {
//               workOrderId: workOrder.id,
//               orderId: toOrder?.id,
//               userId: null,
//               description: '',
//             },
//           },
//         ];
//         // 전송후 작업지시 pending상태로 캐싱, 현재리스트 업데이트
//         workOrder.state = 'pending1';
//         workOrder.data = data;
//         redisUtil.hset(RedisKeys.WorkOrderById, workOrder.id.toString(), JSON.stringify(workOrder));
//         void workOrderService.edit(
//           { id: workOrder.id, state: workOrder.state, data: data },
//           makeLogFormat({} as RequestLog)
//         );

//         console.log(`작업 ${workOrder.code}가 AMR ${selectedAMR.name || ''}에 할당되었습니다.`);
//       } else {
//         console.log(`작업 ${workOrder.code}를 수행할 AMR이 없습니다.`);
//       }
//     }
//   };

//   const sendChargeJob = async (
//     worker: { id: number; code: string },
//     charger: { id: number; code: string },
//     workingPercent: number,
//     description?: string
//   ) => {
//     const wsUtil = useWsUtil();
//     const chargerObject = await redisUtil.hgetObject<ChargerAttributesDeep>(
//       RedisKeys.InfoChargerById,
//       charger.id.toString()
//     );
//     if (!chargerObject) {
//       logging.ACTION_ERROR({
//         filename: 'facilityUtil.ts.sendChargeJob',
//         error: `redis에 ${RedisKeys.InfoChargerById}, ${charger.id} 데이터가 없습니다.`,
//         params: null,
//         result: false,
//       });
//       return;
//     }
//     // instruction의 기본값은 도킹없이 충전해야하는 경우임
//     let instructions: Record<string, any>[] = [
//       {
//         id: '1',
//         func_name: 'charge',
//         args: {
//           resource: charger.code,
//           finishing_timeout: -1,
//           working_percent: workingPercent <= 100 ? workingPercent : 100,
//         },
//       },
//     ];

//     if (chargerObject.dockingLocId) {
//       //도킹후 충전해야하는 경우
//       const dockingLocation = chargerObject.DockingLoc?.tag;
//       instructions = [
//         {
//           id: '1',
//           func_name: 'move',
//           args: {
//             destination: dockingLocation,
//             finishing_timeout: -1,
//           },
//         },
//         {
//           id: '2',
//           func_name: 'event_listener',
//           args: {
//             event_type: 'wait',
//             listenTo: 'fms',
//             timeout: '-1',
//           },
//         },
//         {
//           id: '3',
//           func_name: 'charge',
//           args: {
//             resource: charger.code,
//             finishing_timeout: -1,
//             working_percent: workingPercent <= 100 ? workingPercent : 100,
//           },
//         },
//       ];
//     }
//     // TODO: 도킹 여부 확인 위치정보 추가로 필요함 이거 charger 정보에서 받아야할듯
//     wsUtil.setJob('charge', { id: worker.id, code: worker.code }, instructions, 'auto', {
//       description: description,
//     });

//     chargerObject.state = 'waiting';
//     const chargeHistoryInsertParams: ChargeHistoryInsertParams = {
//       chargerId: charger.id,
//       facilityId: worker.id,
//       chargerState: chargerObject.state,
//       startBattery: null,
//       endBattery: null,
//       startDate: null,
//       endDate: null,
//     };
//     try {
//       const insertedResult = await chargeHistoryService.reg(chargeHistoryInsertParams, makeLogFormat({} as RequestLog));
//       const redisSetParams = {
//         id: insertedResult.insertedId,
//         ...chargeHistoryInsertParams,
//       };
//       redisUtil.hset(RedisKeys.FacilityCurrentCharger, worker.code, JSON.stringify(redisSetParams));
//       redisUtil.hset(RedisKeys.InfoChargerById, charger.id.toString(), JSON.stringify(chargerObject));
//       redisUtil.hset(RedisKeys.InfoChargerByResource, charger.code, JSON.stringify(chargerObject));
//     } catch (err) {
//       logging.ACTION_ERROR({
//         filename: 'facilityUtil.ts.sendChargeJob',
//         error: err,
//         params: null,
//         result: false,
//       });
//       return;
//     }
//   };
//   const cancelCharging = async (code: string) => {
//     // 충전작업이 완료전에 취소되면 충전기 상태관련 업데이트를 해준다

//     const facilityCurrentCharger = await redisUtil.hgetObject<FacilityCurrentChargerTypes>(RedisKeys.FacilityCurrentCharger, code);
//     if (!facilityCurrentCharger) {
//       logging.ACTION_DEBUG({
//         filename: 'facilityUtil.ts.cancelCharging',
//         error: `redis에 ${RedisKeys.FacilityCurrentCharger}, ${code} 데이터가 없습니다.`,
//         params: null,
//         result: false,
//       });
//       return;
//     }
//     await useChargerUtil().changeChargerState(facilityCurrentCharger.chargerId, 'standby');
//     redisUtil.hdel(RedisKeys.FacilityCurrentCharger, code);
//   };
//   const checkAlarm = async (code: string) => {
//     const facilityStatus = await redisUtil.hgetObject<FacilityStatusType>(RedisKeys.WorkerStatus, code);
//     if (!facilityStatus) {
//       logging.ACTION_ERROR({
//         filename: 'facilityUtil.ts.checkAlarm',
//         error: `redis에 ${RedisKeys.WorkerStatus}, ${code} 데이터가 없습니다.`,
//         params: null,
//         result: false,
//       });
//       return;
//     }
//     const facilityInfo = await redisUtil.hgetObject<FacilityAttributesDeep>(RedisKeys.InfoFacility, code);
//     if (!facilityInfo) {
//       logging.ACTION_ERROR({
//         filename: 'facilityUtil.ts.checkAlarm',
//         error: `redis에 ${RedisKeys.InfoFacility}, ${code} 데이터가 없습니다.`,
//         params: null,
//         result: false,
//       });
//       return;
//     }
//     const nowCharging = facilityStatus.type_specific.battery.now_charging;
//     const statusToggle = (facilityStatus.status_toggle as string[]).filter((status) =>
//       StatusToggleAlarmList.includes(status)
//     );
//     const alarmBattery = await redisUtil.hgetObject<AlarmAttributes>(RedisKeys.AlarmBattery, code);
//     const alarmStatusToggle = (await redisUtil.hgetObject<string[]>(RedisKeys.AlarmStatusToggle, code)) || [];
//     const statusToggleSet = new Set(statusToggle);
//     const alarmStatusToggleSet = new Set(alarmStatusToggle);
//     if (nowCharging === true && alarmBattery) {
//       void alarmService.clear({ facilityId: facilityInfo.id, type: 'battery' });
//     }
//     if (statusToggle.length > alarmStatusToggle.length) {
//       // 신규알람 발생
//       const newAlarmTypes = [...statusToggleSet].filter((v) => !alarmStatusToggleSet.has(v));
//       newAlarmTypes.forEach((alarmType) => {
//         void alarmService.reg(
//           {
//             facilityId: facilityInfo.id,
//             isclear: false,
//             type: alarmType,
//             data: { message: `${alarmType} 알람 발생-각상태별 문구 정의 필요` },
//           },
//           makeLogFormat({} as RequestLog)
//         );
//       });
//     } else if (statusToggle.length === alarmStatusToggle.length) {
//       const newAlarmTypes = [...statusToggleSet].filter((v) => !alarmStatusToggleSet.has(v));
//       newAlarmTypes.forEach((alarmType) => {
//         void alarmService.reg(
//           {
//             facilityId: facilityInfo.id,
//             isclear: false,
//             type: alarmType,
//             data: { message: `${alarmType} 알람 발생-각상태별 문구 정의 필요` },
//           },
//           makeLogFormat({} as RequestLog)
//         );
//       });
//       const clearAlarmTypes = [...alarmStatusToggleSet].filter((v) => !statusToggleSet.has(v));
//       clearAlarmTypes.forEach((alarmType) => {
//         void alarmService.clear({
//           facilityId: facilityInfo.id,
//           type: alarmType,
//         });
//       });
//     } else if (statusToggle.length < alarmStatusToggle.length) {
//       // 기존알람 해제
//       const clearAlarmTypes = [...alarmStatusToggleSet].filter((v) => !statusToggleSet.has(v));
//       clearAlarmTypes.forEach((alarmType) => {
//         void alarmService.clear({
//           facilityId: facilityInfo.id,
//           type: alarmType,
//         });
//       });
//     }
//   };
//   const handleDocking = async (code: string) => {
//     // 무조건 채워야하는 위치에 대한 도킹 로직
//     const facilityStatus = await redisUtil.hgetAllObject(RedisKeys.WorkerStatus);
//   };

//   // facility의 배터리량에 따른 충전 로직 (충전기로 보내는 행위만 한다. 충전기에서 나오는건 작업할당 쪽에서 해야 맞음)
//   const handleCharging = async (code: string) => {
//     const facilityStatus = await redisUtil.hgetObject<FacilityStatusType | null>(RedisKeys.WorkerStatus, code);
//     if (!facilityStatus) {
//       logging.ACTION_ERROR({
//         filename: 'facilityUtil.ts',
//         error: `redis에 feedback_worker_status, ${code} 데이터가 없습니다.`,
//         params: null,
//         result: false,
//       });
//       return;
//     }
//     const facilityCurrentCharger = await redisUtil.hgetObject<FacilityCurrentChargerTypes>(
//       RedisKeys.FacilityCurrentCharger,
//       facilityStatus.id
//     );

//     if (facilityStatus.status !== 'idle' || facilityCurrentCharger) {
//       // console.log(`${code} facility이 현재 idle 상태가 아니거나 facilityCurrentCharger 데이터가 있으므로 충전 판단 로직을 실행하지 않습니다.`);
//       return;
//     }

//     // 설정값 조회
//     const facilitySetting = await redisUtil.hgetObject<FacilitySetting>(RedisKeys.Setting, RedisSettingKeys.FacilitySetting);
//     if (!facilitySetting) {
//       logging.ACTION_ERROR({
//         filename: 'facilityUtil.ts',
//         error: 'redis에 facilitySetting 데이터가 없습니다.',
//         params: null,
//         result: false,
//       });
//       return;
//     }
//     // facility 기본정보 조회
//     const facilityInfoList = await redisUtil.hgetAllObject<FacilityAttributesDeep>(RedisKeys.InfoFacility);
//     if (!facilityInfoList) {
//       logging.ACTION_ERROR({
//         filename: 'facilityUtil.ts',
//         error: 'redis에 info_facility 데이터가 없습니다.',
//         params: null,
//         result: false,
//       });
//       return;
//     }
//     // 충전기 기본정보 조회
//     const chargerInfoList = await redisUtil.hgetAllObject<ChargerAttributesDeep>(RedisKeys.InfoChargerById);
//     if (!chargerInfoList) {
//       logging.ACTION_ERROR({
//         filename: 'facilityUtil.ts',
//         error: 'redis에 info_charger 데이터가 없습니다.',
//         params: null,
//         result: false,
//       });
//       return;
//     }

//     //충전여부 판단에 필요한 데이터만 추출
//     const targetFacilityData = {
//       id: facilityStatus.id,
//       name: facilityStatus.name,
//       battery: facilityStatus.type_specific.battery,
//       point: facilityStatus.type_specific.location.pose2d,
//     };
//     const facilityRecentTask = await redisUtil.hgetObject<TaskTypes>(RedisKeys.FacilityRecentTaskById, facilityStatus.id.toString());
//     if (
//       !facilityRecentTask?.params.title.includes('charge') &&
//       targetFacilityData.battery.now_charging === false &&
//       targetFacilityData.battery.battery_level < facilitySetting.data.newTaskMinBattery
//     ) {
//       const facilityInfo = facilityInfoList.find((facility) => facility.code === targetFacilityData.id);
//       if (!facilityInfo) {
//         logging.ACTION_ERROR({
//           filename: 'facilityUtil.ts',
//           error: 'usageFacilityList에서 검색된 facilityInfo 정보가 없습니다.',
//           params: null,
//           result: false,
//         });
//         return;
//       }

//       // 최소 배터리 이하 도달시 알람 발생
//       void alarmService.reg(
//         {
//           facilityId: facilityInfo.id,
//           partId: null,
//           data: {
//             mesaage: `facility(${facilityInfo.id}, ${facilityInfo.code})의 배터리가 ${targetFacilityData.battery.battery_level}%입니다. 충전이 필요합니다. (최소 배터리 기준: ${facilitySetting.data.newTaskMinBattery}%)`,
//           },
//           isclear: false,
//           type: 'battery',
//         },
//         makeLogFormat({} as RequestLog)
//       );
//       // 현재 판단하려는 충전기들의 정보
//       const basicChargerId = facilityInfo.Charger.active === true ? facilityInfo.chargerId : null;
//       const basicCharger = basicChargerId
//         ? await redisUtil.hgetObject<ChargerAttributesDeep>(RedisKeys.InfoChargerById, basicChargerId?.toString())
//         : null;
//       const usageChargerList = chargerInfoList.filter(
//         (charger) => charger.state === 'standby' && charger.active === true
//       );
//       console.log('🚀 ~ handleCharging ~ usageChargerList:', usageChargerList);
//       const usageEmergancyChargerList = usageChargerList.filter((charger) => charger.emergency === true);
//       console.log('🚀 ~ handleCharging ~ usageEmergancyChargerList:', usageEmergancyChargerList);

//       // 1. 비상 충전기 중에 가까운 충전기
//       // 가까운 충전기중에 사용가능한곳으로 가야함 --> 사용가능한 충전기 리스트먼저 찾고나서 하나 이리스트가 없으면 3번으로 빠지면됨
//       if (usageEmergancyChargerList.length > 0) {
//         const nearbyEmergancyChargerList = usageEmergancyChargerList.sort((a: any, b: any) => {
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//           const distanceA = calculateDistance(targetFacilityData.point, a.Location.data.param_point.pose);
//           const distanceB = calculateDistance(targetFacilityData.point, b.Location.data.param_point.pose);
//           a.distance = distanceA;
//           b.distance = distanceB;
//           // 거리가 짧은 충전기 순으로 정렬
//           return distanceA - distanceB;
//         });
//         const nearestCharger = nearbyEmergancyChargerList[0];
//         const workingPercent = facilitySetting.data.chargingTaskMinBattery;
//         const resource = nearestCharger?.Location?.tag;
//         if (!resource) {
//           logging.ACTION_ERROR({
//             filename: 'facilityUtil.ts',
//             error: '충전기의 location.tag 정보가 없습니다.',
//             params: null,
//             result: false,
//           });
//           return;
//         }
//         void sendChargeJob(
//           { id: facilityInfo.id, code: facilityInfo.code },
//           { id: nearestCharger.id, code: resource },
//           workingPercent
//         );
//         return;
//       }
//       // 충전을 해야하는 경우 어떤 충전기로 갈지 판단
//       // 2. facility의 지정 충전기
//       if (basicCharger && basicCharger.state === 'standby') {
//         const workingPercent = facilitySetting.data.chargingTaskMinBattery;
//         void sendChargeJob(
//           { id: facilityInfo.id, code: facilityInfo.code },
//           { id: basicCharger.id, code: basicCharger.Location?.tag || '' },
//           workingPercent
//         );
//         return;
//       }
//       // 3. 가까운 충전기 (기본충전기가 없거나 이미 사용중일 경우 가까운 충전기로 간다)
//       // console.log('🚀 ~ handleCharging ~ usageChargerList:', usageChargerList);
//       if (usageChargerList.length <= 0) {
//         logging.ACTION_ERROR({
//           filename: 'facilityUtil.ts',
//           error: '충전 가능한 충전기가 없습니다.',
//           params: null,
//           result: false,
//         });
//         return;
//       }
//       const nearbyChargerList = usageChargerList.sort((a: any, b: any) => {
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//         const distanceA = calculateDistance(targetFacilityData.point, a.Location.data.param_point.pose);
//         const distanceB = calculateDistance(targetFacilityData.point, b.Location.data.param_point.pose);
//         a.distance = distanceA;
//         b.distance = distanceB;
//         // 거리가 짧은 충전기 순으로 정렬
//         return distanceA - distanceB;
//       });
//       // console.log('🚀 ~ nearbyChargerList ~ nearbyChargerList:', nearbyChargerList);
//       // 가까운 충전기중에 사용가능한곳으로 가야함 --> 사용가능한 충전기 리스트먼저 찾고나서 하나 이리스트가 없으면 3번으로 빠지면됨
//       const nearestCharger = nearbyChargerList[0];
//       const workingPercent = facilitySetting.data.chargingTaskMinBattery;
//       const resource = nearestCharger?.Location?.tag;
//       if (!resource) {
//         logging.ACTION_ERROR({
//           filename: 'facilityUtil.ts',
//           error: '충전기의 location.tag 정보가 없습니다.',
//           params: null,
//           result: false,
//         });
//         return;
//       }
//       void sendChargeJob(
//         { id: facilityInfo.id, code: facilityInfo.code },
//         { id: nearestCharger.id, code: resource },
//         workingPercent
//       );
//     }
//   };
//   const manageCharingHistory = async (code: string) => {
//     // console.log(`${code} facility 충전 판단 로직 실행`);
//     const facilityStatus = await redisUtil.hgetObject<FacilityStatusType>(RedisKeys.WorkerStatus, code);
//     if (!facilityStatus) {
//       logging.ACTION_DEBUG({
//         filename: 'facilityUtil.ts.manageCharingHistory',
//         error: `redis에 ${RedisKeys.WorkerStatus}, ${code} 데이터가 없습니다.`,
//         params: null,
//         result: false,
//       });
//       return;
//     }
//     const nowCharging = facilityStatus.type_specific.battery.now_charging;
//     const batteryLevel = facilityStatus.type_specific.battery.battery_level;

//     const facilityCurrentCharger = await redisUtil.hgetObject<FacilityCurrentChargerTypes>(
//       RedisKeys.FacilityCurrentCharger,
//       facilityStatus.id
//     );
//     if (!facilityCurrentCharger) {
//       logging.ACTION_DEBUG({
//         filename: 'facilityUtil.ts.manageCharingHistory',
//         error: `redis에 ${RedisKeys.FacilityCurrentCharger}, ${code} 데이터가 없습니다.`,
//         params: null,
//         result: false,
//       });
//       return;
//     }
//     const targetCharger = await redisUtil.hgetObject<ChargerAttributesDeep>(
//       RedisKeys.InfoChargerById,
//       facilityCurrentCharger?.chargerId.toString()
//     );
//     if (!targetCharger) {
//       logging.ACTION_DEBUG({
//         filename: 'facilityUtil.ts.manageCharingHistory',
//         error: `redis에 ${RedisKeys.InfoChargerById}, ${facilityCurrentCharger?.chargerId} 데이터가 없습니다.`,
//         params: null,
//         result: false,
//       });
//       return;
//     }
//     // console.log('🚀 ~ manageCharingHistory ~ facilityCurrentCharger:', facilityCurrentCharger, nowCharging, batteryLevel);
//     if (facilityCurrentCharger.startDate === null && nowCharging === true) {
//       // 충전이력 데이터가 있고 facility의 충전여부가 활성화일때 (충전시작)
//       facilityCurrentCharger.startBattery = batteryLevel;
//       facilityCurrentCharger.startDate = new Date();
//       facilityCurrentCharger.chargerState = 'charging';
//       targetCharger.state = 'charging';
//       void chargeHistoryService.edit(facilityCurrentCharger, makeLogFormat({} as RequestLog));
//       redisUtil.hset(RedisKeys.FacilityCurrentCharger, facilityStatus.id, JSON.stringify(facilityCurrentCharger));
//       redisUtil.hset(RedisKeys.InfoChargerById, targetCharger.id.toString(), JSON.stringify(targetCharger));
//       redisUtil.hset(RedisKeys.InfoChargerById, targetCharger.Location?.tag || '', JSON.stringify(targetCharger));
//       // redisUtil.hset(RedisKeys.InfoChargerByResource, facilityStatus.id, JSON.stringify(facilityCurrentCharger));
//     } else if (facilityCurrentCharger.startDate && nowCharging === false) {
//       // 충전이력 데이터가 있고 startDate가 있는데 facility의 충전여부가 비활성화일때 (충전종료, 충전기 이탈)
//       facilityCurrentCharger.endBattery = batteryLevel;
//       facilityCurrentCharger.endDate = new Date();
//       facilityCurrentCharger.chargerState = 'standby';
//       targetCharger.state = 'standby';
//       void chargeHistoryService.edit(facilityCurrentCharger, makeLogFormat({} as RequestLog));
//       redisUtil.hdel(RedisKeys.FacilityCurrentCharger, facilityStatus.id);
//       // TODO: 충전기상태 한번에 업데이트하는 함수 만들어둘것 chargerUtil에
//       redisUtil.hset(RedisKeys.InfoChargerById, targetCharger.id.toString(), JSON.stringify(targetCharger));
//       redisUtil.hset(RedisKeys.InfoChargerById, targetCharger.Location?.tag || '', JSON.stringify(targetCharger));
//     }
//   };
//   // 작업 할당 로직
//   const assignTask = async () => {
//     // 남은 작업지시 목록 조회
//     if (isAssignTaskProgress === true) {
//       console.log('이미 로직 실행중');
//     }
//     isAssignTaskProgress = true;
//     const workOrderList = await redisUtil.hgetAllObject<WorkOrderAttributesDeep>(RedisKeys.WorkOrderById);
//     if (!workOrderList) {
//       logging.ACTION_DEBUG({
//         filename: 'facilityUtil.ts',
//         error: `redis에 ${RedisKeys.WorkOrderById} 데이터가 없습니다. (할당할 내용이 없음)`,
//         params: null,
//         result: false,
//       });
//       console.log(`redis에 ${RedisKeys.WorkOrderById} 데이터가 없습니다. (할당할 내용이 없음)`);
//       return;
//     }
//     // 작업할당 우선순위 설정값 조회
//     const assignmentPriorirySetting = await redisUtil.hgetObject<AssignmentPriorirySetting>(
//       RedisKeys.Setting,
//       RedisSettingKeys.AssignmentPrioriry
//     );
//     if (!assignmentPriorirySetting) {
//       logging.ACTION_ERROR({
//         filename: 'facilityUtil.ts',
//         error: 'redis에 assignmentPriorirySetting 데이터가 없습니다.',
//         params: null,
//         result: false,
//       });
//       return;
//     }
//     // facility info 정보 조회
//     const facilityInfoList = await redisUtil.hgetAllObject<FacilityAttributesDeep>(RedisKeys.InfoFacility);
//     if (!facilityInfoList) {
//       logging.ACTION_ERROR({
//         filename: 'facilityUtil.ts',
//         error: `redis에 ${RedisKeys.InfoFacility} 데이터가 없습니다.`,
//         params: null,
//         result: false,
//       });
//       return;
//     }

//     // *필요한 데이터 추출*
//     // 우선순위 리스트 가져오기
//     const assignmentPrioriryList = assignmentPriorirySetting.data.prioriry;
//     // 작업 가능한 facility 찾기
//     const sortedWorkOrderList = sortedWorkOrderPrioiry([...workOrderList]);
//     const availableFacilityInfoList = await filterFacilitysByGroupRate(facilityInfoList);
//     const sortedFacilityInfoList = findUsageFacilitysSortedByBatteryDesc(availableFacilityInfoList);

//     await assignOptimalAMR(sortedWorkOrderList, sortedFacilityInfoList, assignmentPrioriryList);
//     isAssignTaskProgress = false;
//   };
//   const processFacilityStatus = async (code: string) => {
//     await checkAlarm(code);
//     await handleDocking(code);
//     await handleCharging(code);
//     await manageCharingHistory(code);
//     await assignTask();
//   };

//   return {
//     calculateDistance,
//     sendChargeJob,
//     cancelCharging,
//     checkAlarm,
//     handleDocking,
//     handleCharging,
//     manageCharingHistory,
//     assignTask,
//     processFacilityStatus,
//   };
// };
