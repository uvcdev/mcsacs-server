/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import logger from './logger';
import { v4 as uuidv4 } from 'uuid';
import { ResponseJson, responseCode, SelectedInfoResult } from './resUtil';
import requestIp from 'request-ip';
import { logDao } from '../dao/timescale/logDao';
import { itemLogDao } from '../dao/timescale/itemLogDao';
import { MqttTopics, sendMqtt } from './mqttUtil';
import { ItemLogInsertParams } from '../models/timescale/itemLog';

export interface LogHeader {
  traceId: string | null; // 외부에서 API를 호출했을때 사용 할 "외부용 추적 키 값" (보통 Front-end에서 생성함)
  spanId: string; // API가 호출되었을때 Request당 하나씩 만든다. "내부용 추적 키 값" (uuidv4로 생성함)
  clientIp: string; // 클라이언트 IP (request-ip를 이용해서 추출함)
  accessToken: string | null; // 접속자의 토큰 정보
}

export interface RequestLog {
  headers?: { [key: string]: unknown };
  method: string;
  hostname: string;
  baseUrl: string;
  originalUrl: string;
  params: unknown;
  query: unknown;
  body: unknown;
}

export interface ActionLog {
  filename: string | null;
  params: unknown;
  result: unknown;
  error: unknown;
}

export interface SystemLog {
  title: string | null;
  message: unknown;
  error?: unknown;
}

// (번외)테스트 출력용 로그 포맷
interface TestLogFormat {
  timestamp: string;
  testLog: unknown;
}

// MQTT 전용 로그
interface MqttLogFormat {
  title: string;
  topic?: string;
  message: unknown;
  error?: unknown;
}
type WsLogFormat = {
  // WebSocket 로그에 필요한 필드들을 정의
  // 예시:
  message: string;
  error?: unknown;
  // 기타 필요한 필드 추가
};

type CacheLogFormat = {
  message: string;
  error?: unknown;
};

// 최종 로그 포맷은 이러하다.
export interface LogFormat<T> {
  timestamp: string;
  logLevel: string;
  logPoint: string;
  traceId: LogHeader['traceId'];
  spanId: LogHeader['spanId'];
  accessToken: LogHeader['accessToken'];
  clientIp: LogHeader['clientIp'];
  requestLog: RequestLog;
  actionLog: ActionLog;
  responseLog: ResponseJson<T>;
  systemLog: SystemLog;
}

type PartDetail = {
  partcount: number; // '수량'은 숫자 데이터 타입으로 가정합니다.
  partno: string;
  parttype: string;
  partinfo: string;
};
type AcsDetail = {
  itemCode: string | null;
  facilityCode: string | null;
  facilityName: string | null;
  amrCode: string | null;
  amrName: string | null;
};
type RobotTransport = {
  id: string; // 'GUID'를 문자열로 가정합니다.
  start: string;
  dest: string;
  robot: string;
  detail: PartDetail;
  acsDetail: AcsDetail;
};

type PayloadDetail = {
  partid: string;
  partstatus: string;
  partcount: number; // '제품수량'은 숫자 데이터 타입으로 가정합니다.
};

type Payload = {
  code: string;
  floor: number; // '적재층 번호'를 숫자로 가정합니다.
  index: number; // '적재 공간 번호'를 숫자로 가정합니다.
  loadstate: string;
  detail: PayloadDetail;
};

type Location = {
  location: string;
  locationtype: string;
  payloadtype: string;
  payloads: Payload[];
};

type LocationsData = {
  acsDetail: AcsDetail;
  locations: Location[];
};

type MissionState =
  | 'MISSION_INITIATED'
  | 'AMR_ASSIGNED'
  | 'AMR_ARRIVED'
  | 'AMR_ACQUIRE_STARTED'
  | 'AMR_ACQUIRE_COMPLETED'
  | 'CARRIER_TRANSFERRING'
  | 'AMR_DEPOSIT_STARTED'
  | 'AMR_DEPOSIT_COMPLETED'
  | 'AMR_UNASSIGNED'
  | 'MISSION_COMPLETED'
  | 'MISSION_CANCELED'
  | 'MISSION_FAILED';

type MissionStateData = {
  mission: string;
  state: MissionState;
  assign: {
    robot: string;
    task: MissionState;
  };
  acsDetail: AcsDetail;
};

// 기본 로그 포맷 만들어 주기
export function makeLogFormat(req: RequestLog): LogFormat<unknown> {
  return {
    timestamp: '',
    logLevel: '',
    logPoint: '',
    traceId: req.headers && req.headers['trace-id'] ? (req.headers['trace-id'] as string) : null,
    spanId: uuidv4(),
    accessToken: req.headers && req.headers['access-token'] ? (req.headers['access-token'] as string) : null,
    clientIp: requestIp.getClientIp(req as unknown as requestIp.Request)?.toString() as string,
    requestLog: {
      method: req.method,
      hostname: req.hostname,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
    },
    actionLog: { filename: null, params: null, result: null, error: null },
    responseLog: responseCode.DEFAULT,
    systemLog: { title: null, message: null },
  };
}

// 각 프로세스별 로깅 처리
export const logging = {
  TEST_LOG(testLog: unknown): void {
    // 용도: 개발 시 디버깅용 로그(실 운영시 사용 금지!)
    const logLevel = 'debug';
    try {
      const logFormat: TestLogFormat = {
        timestamp: new Date().toISOString(),
        testLog,
      };
      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'TEST_LOG',
        data: logFormat,
      });
    } catch (error) {
      console.log('logging.ERROR_METHOD', error);
    }
  },
  SYSTEM_LOG(systemLog: SystemLog): void {
    // 용도: 시스템용 로그(시스템에서 동작 시 로깅처리)
    const logLevel = 'info';
    try {
      const logFormat: LogFormat<unknown> = {
        timestamp: new Date().toISOString(),
        logLevel,
        logPoint: 'SYSTEM_LOG',
        traceId: '',
        spanId: '',
        accessToken: null,
        clientIp: '',
        requestLog: {
          method: '',
          hostname: '',
          baseUrl: '',
          originalUrl: '',
          params: {},
          query: {},
          body: {},
        },
        actionLog: {
          filename: '',
          params: null,
          result: null,
          error: null,
        },
        responseLog: {
          status: 0,
          code: '',
          message: null,
          data: null,
          remark: null,
        },
        systemLog,
      };
      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'SYSTEM_LOG',
        data: logFormat,
      });
    } catch (error) {
      console.log('logging.ERROR_METHOD', error);
    }
  },
  SYSTEM_ERROR(systemLog: SystemLog, err: Error): void {
    // 용도: 시스템용 에러 로그(시스템에서 동작 시 로깅처리)
    const logLevel = 'error';

    try {
      const error = {
        message: err instanceof Error ? err.message : '',
        stack: err instanceof Error ? err.stack : '',
      };

      const logFormat: LogFormat<unknown> = {
        timestamp: new Date().toISOString(),
        logLevel,
        logPoint: 'SYSTEM_ERROR',
        traceId: '',
        spanId: '',
        accessToken: null,
        clientIp: '',
        requestLog: {
          method: '',
          hostname: '',
          baseUrl: '',
          originalUrl: '',
          params: {},
          query: {},
          body: {},
        },
        actionLog: {
          filename: '',
          params: null,
          result: null,
          error: null,
        },
        responseLog: {
          status: 0,
          code: '',
          message: null,
          data: null,
          remark: null,
        },
        systemLog: {
          ...systemLog,
          error,
        },
      };
      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'SYSTEM_ERROR',
        data: logFormat,
      });
    } catch (error) {
      console.log('logging.ERROR_METHOD', error);
    }
  },
  REQUEST_PARAM(logFormat: LogFormat<unknown>): void {
    // 용도: API 요청(request)시 로깅 처리
    const logLevel = 'info';

    // 요청값 안에 password가 있으면 '******'로 치환 한다.
    try {
      if (logFormat.requestLog.body && 'password' in (logFormat.requestLog.body as { password?: string })) {
        logFormat = {
          ...logFormat,
          requestLog: {
            ...logFormat.requestLog,
            body: {
              ...(logFormat.requestLog.body as { password?: string }),
              password: '******',
            },
          },
        };
      }

      const logPrint = {
        ...logFormat,
        timestamp: new Date().toISOString(),
        logLevel,
        logPoint: 'REQUEST_PARAM',
      };
      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'REQUEST_PARAM',
        data: logPrint,
      });
    } catch (error) {
      console.log('logging.REQUEST_PARAM', error);
    }
  },
  METHOD_ACTION(logFormat: LogFormat<unknown>, filename: string, params: unknown, result: unknown): void {
    // 용도: 메소드 동작시 로깅 처리
    const logLevel = 'debug';

    // 요청값 안에 password가 있으면 '******'로 치환 한다.
    try {
      if (logFormat.requestLog.body && 'password' in (logFormat.requestLog.body as { password?: string })) {
        logFormat = {
          ...logFormat,
          requestLog: {
            ...logFormat.requestLog,
            body: {
              ...(logFormat.requestLog.body as { password?: string }),
              password: '******',
            },
          },
        };
      }

      // actionLog.params안에 password가 있으면 '******'로 치환 한다.
      if (params && 'password' in (params as { password?: string })) {
        params = {
          ...(params as { password?: string }),
          password: '******',
        };
      }

      const logPrint = {
        ...logFormat,
        timestamp: new Date().toISOString(),
        logLevel,
        logPoint: 'METHOD_ACTION',
        actionLog: {
          filename,
          params,
          result,
          error: null,
        },
      };
      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'METHOD_ACTION',
        data: logPrint,
      });
    } catch (error) {
      console.log('logging.ERROR_METHOD', error);
    }
  },
  ERROR_METHOD(logFormat: LogFormat<unknown>, filename: string, params: unknown, error: unknown): void {
    // 용도: 예외처리 발생 시 로깅 처리
    const logLevel = 'error';

    // 요청값 안에 password가 있으면 '******'로 치환 한다.
    try {
      if (logFormat.requestLog.body && 'password' in (logFormat.requestLog.body as { password?: string })) {
        logFormat = {
          ...logFormat,
          requestLog: {
            ...logFormat.requestLog,
            body: {
              ...(logFormat.requestLog.body as { password?: string }),
              password: '******',
            },
          },
        };
      }

      let actionError = null;
      if (error instanceof Error) {
        actionError = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      } else {
        actionError = error;
      }

      const logPrint = {
        ...logFormat,
        timestamp: new Date().toISOString(),
        logLevel,
        logPoint: 'ERROR_METHOD',
        actionLog: {
          filename,
          params,
          result: null,
          error: actionError,
        },
      };
      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'ERROR_METHOD',
        data: logPrint,
      });
    } catch (error) {
      console.log('logging.ERROR_METHOD', error);
    }
    // logger[logLevel](JSON.stringify(logPrint));
  },
  RESPONSE_DATA(logFormat: LogFormat<unknown>, responseLog: ResponseJson<unknown>): void {
    try {
      // 용도: 최종 응답에 대한 로깅 처리
      const logLevel = 'info';

      // 요청값 안에 password가 있으면 '******'로 치환 한다.
      if (logFormat.requestLog.body && 'password' in (logFormat.requestLog.body as { password?: string })) {
        logFormat = {
          ...logFormat,
          requestLog: {
            ...logFormat.requestLog,
            body: {
              ...(logFormat.requestLog.body as { password?: string }),
              password: '******',
            },
          },
        };
      }

      // 응답값 안에 리스트가 있으면 id(pk)값만 추출해 준다. (데이터 절약을 위해)
      // case 1. 'list'를 이용한 검색 리스트 출력 로그('SelectedListResult<T>'인 경우)
      if (responseLog.data && 'rows' in responseLog.data) {
        if (responseLog.data.rows && Array.isArray(responseLog.data.rows)) {
          responseLog = {
            ...responseLog,
            data: {
              ...responseLog.data,
              rows: [responseLog.data.rows.length],
            },
          };
        }
      } else if (typeof responseLog.data === 'object') {
        responseLog = {
          ...responseLog,
          data: {
            id: (responseLog.data as { id?: number })?.id || 0,
          },
          // data: responseLog.data.map((row: unknown) => (row as SelectedInfoResult).id), // --> 왜 이렇게 했는지 기억이 안난다. (id가 없는 List도 있는데)
          // data: responseLog.data,
        };
      }

      // case 2. 'listAll'을 이용한 전체 리스트 출력('SelectedAllResult<T>'인 경우)
      if (Array.isArray(responseLog.data)) {
        responseLog = {
          ...responseLog,
          data: [`length: ${responseLog.data.length}`],
          // data: responseLog.data.map((row: unknown) => (row as SelectedInfoResult).id), // --> 왜 이렇게 했는지 기억이 안난다. (id가 없는 List도 있는데)
          // data: responseLog.data,
        };
      }

      const logPrint = {
        ...logFormat,
        responseLog,
      };
      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'RESPONSE_DATA',
        data: logPrint,
      });
    } catch (error) {
      console.log('logging.RESPONSE_DATA', error);
    }
  },
  MQTT_LOG(mqttLog: MqttLogFormat): void {
    try {
      const logLevel = 'info';

      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'MQTT_LOG',
        data: mqttLog,
      });
    } catch (error) {
      console.log('logging.MQTT_LOG', error);
    }
  },
  MQTT_DEBUG(mqttLog: MqttLogFormat): void {
    try {
      const logLevel = 'debug';

      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'MQTT_DEBUG',
        data: mqttLog,
      });
    } catch (error) {
      console.log('logging.MQTT_DEBUG', error);
    }
  },
  MQTT_ERROR(mqttLog: MqttLogFormat): void {
    try {
      const logLevel = 'error';

      const logFormat = {
        mqttLog: {
          ...mqttLog,
          error: {
            message: mqttLog.error instanceof Error ? mqttLog.error.message : '',
            stack: mqttLog.error instanceof Error ? mqttLog.error.stack : '',
          },
        },
      };

      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'MQTT_ERROR',
        data: logFormat,
      });
    } catch (error) {
      console.log('logging.MQTT_ERROR', error);
    }
  },
  WS_LOG(wsLog: WsLogFormat): void {
    try {
      const logLevel = 'info';

      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'WS_LOG',
        data: wsLog,
      });
    } catch (error) {
      console.log('logging.WS_LOG', error);
    }
  },
  WS_DEBUG(wsLog: WsLogFormat): void {
    try {
      const logLevel = 'debug';

      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'WS_DEBUG',
        data: wsLog,
      });
    } catch (error) {
      console.log('logging.WS_DEBUG', error);
    }
  },
  WS_ERROR(wsLog: WsLogFormat): void {
    try {
      const logLevel = 'error';

      const logFormat = {
        wsLog: {
          ...wsLog,
          error: {
            message: wsLog.error instanceof Error ? wsLog.error.message : '',
            stack: wsLog.error instanceof Error ? wsLog.error.stack : '',
          },
        },
      };

      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'WS_ERROR',
        data: logFormat,
      });
    } catch (error) {
      console.log('logging.MQTT_LOG', error);
    }
  },
  ACTION_INFO(actionLog: ActionLog): void {
    try {
      // 용도: 일반 액션 로그(REQUEST/RESPONSE가 아닌 경우에 대한 로그)
      const logLevel = 'info';

      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'ACTION_INFO',
        data: actionLog,
      });
    } catch (error) {
      console.log('logging.ACTION_INFO', error);
    }
  },
  ACTION_DEBUG(actionLog: ActionLog): void {
    try {
      // 용도: 일반 액션 디버그 로그(REQUEST/RESPONSE가 아닌 경우에 대한 로그)
      const logLevel = 'debug';

      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'ACTION_DEBUG',
        data: actionLog,
      });
    } catch (error) {
      console.log('logging.ACTION_DEBUG', error);
    }
  },
  ACTION_ERROR(actionLog: ActionLog): void {
    try {
      // console.log('🚀 ~ ACTION_ERROR ~ actionLog:', actionLog);
      // 용도: 일반 액션 디버그 로그(REQUEST/RESPONSE가 아닌 경우에 대한 로그)
      const logLevel = 'error';

      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'ACTION_ERROR',
        data: actionLog,
      });
    } catch (error) {
      console.log('logging.ACTION_ERROR', error);
    }
  },
  CACHE_ERROR(cacheLog: CacheLogFormat): void {
    try {
      const logLevel = 'error';

      const logFormat = {
        cacheLog: {
          ...cacheLog,
          error: {
            message: cacheLog.error instanceof Error ? cacheLog.error.message : '',
            stack: cacheLog.error instanceof Error ? cacheLog.error.stack : '',
          },
        },
      };

      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        logLevel: logLevel,
        function: 'CACHE_ERROR',
        data: logFormat,
      });
    } catch (error) {
      console.log('logging.CACHE_ERROR', error);
    }
  },
  ITEM_LOG: {
    TRANSPORT_COMMAND_LOG(data: RobotTransport): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `MCS-${acsDetail.amrCode || ''}-MISSION_COMMAND`,
          subject: 'TRANSPORT_COMMAND',
          body: body,
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.TRaNSPORT_COMMAND_LOG', error);
      }
    },
    LOAD_COMMAND_LOG(data: RobotTransport): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `MCS-${acsDetail.amrCode || ''}-MISSION_COMMAND`,
          subject: 'LOAD_COMMAND',
          body: body,
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.LOAD_COMMAND_LOG', error);
      }
    },
    UNLOAD_COMMAND(data: RobotTransport): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `MCS-${acsDetail.amrCode || ''}-MISSION_COMMAND`,
          subject: 'UNLOAD_COMMAND',
          body: body,
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.UNLOAD_COMMAND', error);
      }
    },
    CANCEL_MISSION_COMMAND(data: { id: string; mission: string; acsDetail: AcsDetail }): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `MCS-${acsDetail.amrCode || ''}-MISSION_COMMAND`,
          subject: 'CANCEL_MISSION_COMMAND',
          body: body,
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.CANCEL_MISSION_COMMAND', error);
      }
    },
    ACK_MISSION_COMPLETED(data: { mission: string; acsDetail: AcsDetail }): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `MCS-${acsDetail.amrCode || ''}-ACK_MISSION_STATE`,
          subject: 'ACK_MISSION_COMPLETED',
          body: body,
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.ACK_MISSION_COMPLETED', error);
      }
    },
    ACK_MISSION_FAILED(data: { mission: string; acsDetail: AcsDetail }): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `MCS-${acsDetail.amrCode || ''}-ACK_MISSION_STATE`,
          subject: 'ACK_MISSION_FAILED',
          body: body,
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.ACK_MISSION_FAILED', error);
      }
    },
    ACK_MISSION_STATE(data: { mission: string; acsDetail: AcsDetail }): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `MCS-${acsDetail.amrCode || ''}-ACK_MISSION_STATE`,
          subject: 'ACK_MISSION_STATE',
          body: body,
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.ACK_MISSION_STATE', error);
      }
    },
    PAYLOAD_STATE(data: LocationsData): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `${acsDetail.amrCode || ''}-MCS-PAYLOAD_STATE`,
          subject: 'PAYLOAD_STATE',
          body: body,
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.PAYLOAD_STATE', error);
      }
    },
    MISSION_STATE(data: MissionStateData): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `${acsDetail.amrCode || ''}-MCS-MISSION_STATE`,
          subject: 'MISSION_STATE',
          body: body,
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.MISSION_STATE', error);
      }
    },
    MISSION_COMPLETED(data: { mission: string; acsDetail: AcsDetail }): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `${acsDetail.amrCode || ''}-MCS-MISSION_STATE`,
          subject: 'MISSION_COMPLETED',
          body: { mission: data.mission, robot: acsDetail.amrCode },
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.MISSION_COMPLETED', error);
      }
    },
    MISSION_FAILED(data: { mission: string; acsDetail: AcsDetail }): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `${acsDetail.amrCode || ''}-MCS-MISSION_STATE`,
          subject: 'MISSION_FAILED',
          body: { mission: data.mission },
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.MISSION_FAILED', error);
      }
    },
    ALARM_REPORT(data: { id: string; code: string; source: string; data: string; acsDetail: AcsDetail }): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `${acsDetail.amrCode || ''}-MCS-ALARM_STATE`,
          subject: 'ALARM_REPORT',
          body: body,
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.ALARM_REPORT', error);
      }
    },
    ALARM_CLEAR(data: { id: string; code: string; source: string; data: string; acsDetail: AcsDetail }): void {
      try {
        const logLevel = 'info';
        const { acsDetail, ...body } = data;
        const insertParams: ItemLogInsertParams = {
          itemCode: acsDetail.itemCode,
          facilityCode: acsDetail.facilityCode,
          facilityName: acsDetail.facilityName,
          amrCode: acsDetail.amrCode,
          amrName: acsDetail.amrName,
          topic: `${acsDetail.amrCode || ''}-MCS-ALARM_STATE`,
          subject: 'ALARM_CLEAR',
          body: body,
        };
        void itemLogDao.insert(insertParams);
      } catch (error) {
        console.log('logging.ITEM_LOG.ALARM_CLEAR', error);
      }
    },
  },
};
