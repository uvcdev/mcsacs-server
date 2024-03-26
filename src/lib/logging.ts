/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import logger from './logger';
import { v4 as uuidv4 } from 'uuid';
import { ResponseJson, responseCode, SelectedInfoResult } from './resUtil';
import requestIp from 'request-ip';
import { logDao } from '../dao/timescale/logDao';

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

// 최종 로그 포맷은 이러하다.
export interface LogFormat<T> {
  timestamp: string;
  type: string;
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

// 기본 로그 포맷 만들어 주기
export function makeLogFormat(req: RequestLog): LogFormat<unknown> {
  return {
    timestamp: '',
    type: '',
    logPoint: '',
    traceId: req.headers && req.headers['trace-id'] ? (req.headers['trace-id'] as string) : null,
    spanId: uuidv4(),
    accessToken: req.headers && req.headers['access-token'] ? (req.headers['access-token'] as string) : null,
    clientIp: requestIp.getClientIp((req as unknown) as requestIp.Request)?.toString() as string,
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
    const type = 'debug';

    const logFormat: TestLogFormat = {
      timestamp: new Date().toISOString(),
      testLog,
    };
    logger[type](JSON.stringify(logFormat));
  },
  SYSTEM_LOG(systemLog: SystemLog): void {
    // 용도: 시스템용 로그(시스템에서 동작 시 로깅처리)
    const type = 'info';

    const logFormat: LogFormat<unknown> = {
      timestamp: new Date().toISOString(),
      type,
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
    logger[type](JSON.stringify(logFormat));
  },
  SYSTEM_ERROR(systemLog: SystemLog, err: Error): void {
    // 용도: 시스템용 에러 로그(시스템에서 동작 시 로깅처리)
    const type = 'error';

    const error = {
      message: err instanceof Error ? err.message : '',
      stack: err instanceof Error ? err.stack : '',
    };

    const logFormat: LogFormat<unknown> = {
      timestamp: new Date().toISOString(),
      type,
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
    logger[type](JSON.stringify(logFormat));
  },
  REQUEST_PARAM(logFormat: LogFormat<unknown>): void {
    // 용도: API 요청(request)시 로깅 처리
    const type = 'info';

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

    const logPrint = {
      ...logFormat,
      timestamp: new Date().toISOString(),
      type,
      logPoint: 'REQUEST_PARAM',
    };
    logger[type](JSON.stringify(logPrint));
  },
  METHOD_ACTION(logFormat: LogFormat<unknown>, filename: string, params: unknown, result: unknown): void {
    // 용도: 메소드 동작시 로깅 처리
    const type = 'debug';

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
      type,
      logPoint: 'METHOD_ACTION',
      actionLog: {
        filename,
        params,
        result,
        error: null,
      },
    };
    logger[type](JSON.stringify(logPrint));
  },
  ERROR_METHOD(logFormat: LogFormat<unknown>, filename: string, params: unknown, error: unknown): void {
    // 용도: 예외처리 발생 시 로깅 처리
    const type = 'error';

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
      type,
      logPoint: 'ERROR_METHOD',
      actionLog: {
        filename,
        params,
        result: null,
        error: actionError,
      },
    };

    logger[type](JSON.stringify(logPrint));
  },
  RESPONSE_DATA(logFormat: LogFormat<unknown>, responseLog: ResponseJson<unknown>): void {
    // 용도: 최종 응답에 대한 로깅 처리
    const type = 'info';

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
      type: type,
      system: null,
      function: 'RESPONSE_DATA',
      data: logPrint,
    });
  },
  MQTT_LOG(mqttLog: MqttLogFormat): void {
    const type = 'info';

    void logDao.insert({
      facilityCode: null,
      facilityName: null,
      amrCode: null,
      amrName: null,
      type: type,
      system: null,
      function: 'MQTT_LOG',
      data: mqttLog,
    });
  },
  MQTT_DEBUG(mqttLog: MqttLogFormat): void {
    const type = 'debug';

    void logDao.insert({
      facilityCode: null,
      facilityName: null,
      amrCode: null,
      amrName: null,
      type: type,
      system: null,
      function: 'MQTT_DEBUG',
      data: mqttLog,
    });
  },
  MQTT_ERROR(mqttLog: MqttLogFormat): void {
    const type = 'error';

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
      type: type,
      system: null,
      function: 'MQTT_ERROR',
      data: logFormat,
    });
  },
  WS_LOG(wsLog: WsLogFormat): void {
    const type = 'info';

    void logDao.insert({
      facilityCode: null,
      facilityName: null,
      amrCode: null,
      amrName: null,
      type: type,
      system: null,
      function: 'WS_LOG',
      data: wsLog,
    });
  },
  WS_DEBUG(wsLog: WsLogFormat): void {
    const type = 'debug';

    void logDao.insert({
      facilityCode: null,
      facilityName: null,
      amrCode: null,
      amrName: null,
      type: type,
      system: null,
      function: 'WS_DEBUG',
      data: wsLog,
    });
  },
  WS_ERROR(wsLog: WsLogFormat): void {
    const type = 'error';

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
      type: type,
      system: null,
      function: 'WS_ERROR',
      data: logFormat,
    });
  },
  ACTION_INFO(actionLog: ActionLog): void {
    // 용도: 일반 액션 로그(REQUEST/RESPONSE가 아닌 경우에 대한 로그)
    const type = 'info';

    void logDao.insert({
      facilityCode: null,
      facilityName: null,
      amrCode: null,
      amrName: null,
      type: type,
      system: null,
      function: 'ACTION_INFO',
      data: actionLog,
    });
  },
  ACTION_DEBUG(actionLog: ActionLog): void {
    // 용도: 일반 액션 디버그 로그(REQUEST/RESPONSE가 아닌 경우에 대한 로그)
    const type = 'debug';

    void logDao.insert({
      facilityCode: null,
      facilityName: null,
      amrCode: null,
      amrName: null,
      type: type,
      system: null,
      function: 'ACTION_DEBUG',
      data: actionLog,
    });
  },
  ACTION_ERROR(actionLog: ActionLog): void {
    // console.log('🚀 ~ ACTION_ERROR ~ actionLog:', actionLog);
    // 용도: 일반 액션 디버그 로그(REQUEST/RESPONSE가 아닌 경우에 대한 로그)
    const type = 'error';

    void logDao.insert({
      facilityCode: null,
      facilityName: null,
      amrCode: null,
      amrName: null,
      type: type,
      system: null,
      function: 'ACTION_ERROR',
      data: actionLog,
    });
  },
};
