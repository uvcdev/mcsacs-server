/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import logger from './logger';
import { v4 as uuidv4 } from 'uuid';
import { ResponseJson, responseCode, SelectedInfoResult } from './resUtil';
import requestIp from 'request-ip';

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

// 기본 로그 포맷 만들어 주기
export function makeLogFormat(req: RequestLog): LogFormat<unknown> {
  return {
    timestamp: '',
    logLevel: '',
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
    const logLevel = 'debug';

    const logFormat: TestLogFormat = {
      timestamp: new Date().toISOString(),
      testLog,
    };
    logger[logLevel](JSON.stringify(logFormat));
  },
  SYSTEM_LOG(systemLog: SystemLog): void {
    // 용도: 시스템용 로그(시스템에서 동작 시 로깅처리)
    const logLevel = 'info';

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
    logger[logLevel](JSON.stringify(logFormat));
  },
  SYSTEM_ERROR(systemLog: SystemLog, err: Error): void {
    // 용도: 시스템용 에러 로그(시스템에서 동작 시 로깅처리)
    const logLevel = 'error';

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
    logger[logLevel](JSON.stringify(logFormat));
  },
  REQUEST_PARAM(logFormat: LogFormat<unknown>): void {
    // 용도: API 요청(request)시 로깅 처리
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

    const logPrint = {
      ...logFormat,
      timestamp: new Date().toISOString(),
      logLevel,
      logPoint: 'REQUEST_PARAM',
    };
    logger[logLevel](JSON.stringify(logPrint));
  },
  METHOD_ACTION(logFormat: LogFormat<unknown>, filename: string, params: unknown, result: unknown): void {
    // 용도: 메소드 동작시 로깅 처리
    const logLevel = 'debug';

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
      logLevel,
      logPoint: 'METHOD_ACTION',
      actionLog: {
        filename,
        params,
        result,
        error: null,
      },
    };
    logger[logLevel](JSON.stringify(logPrint));
  },
  ERROR_METHOD(logFormat: LogFormat<unknown>, filename: string, params: unknown, error: unknown): void {
    // 용도: 예외처리 발생 시 로깅 처리
    const logLevel = 'error';

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
      logLevel,
      logPoint: 'ERROR_METHOD',
      actionLog: {
        filename,
        params,
        result: null,
        error: actionError,
      },
    };

    logger[logLevel](JSON.stringify(logPrint));
  },
  RESPONSE_DATA(logFormat: LogFormat<unknown>, responseLog: ResponseJson<unknown>): void {
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
      timestamp: new Date().toISOString(),
      logLevel,
      logPoint: 'RESPONSE_DATA',
      responseLog,
    };
    logger[logLevel](JSON.stringify(logPrint));
  },
  MQTT_LOG(mqttLog: MqttLogFormat): void {
    const logLevel = 'info';

    const logFormat = {
      timestamp: new Date().toISOString(),
      logLevel,
      logPoint: 'MQTT_LOG',
      mqttLog,
    };
    logger[logLevel](JSON.stringify(logFormat));
  },
  MQTT_DEBUG(mqttLog: MqttLogFormat): void {
    const logLevel = 'debug';

    const logFormat = {
      timestamp: new Date().toISOString(),
      logLevel,
      logPoint: 'MQTT_DEBUG',
      mqttLog,
    };
    logger[logLevel](JSON.stringify(logFormat));
  },
  MQTT_ERROR(mqttLog: MqttLogFormat): void {
    const logLevel = 'error';

    const logFormat = {
      timestamp: new Date().toISOString(),
      logLevel,
      logPoint: 'MQTT_ERROR',
      mqttLog: {
        ...mqttLog,
        error: {
          message: mqttLog.error instanceof Error ? mqttLog.error.message : '',
          stack: mqttLog.error instanceof Error ? mqttLog.error.stack : '',
        },
      },
    };
    logger[logLevel](JSON.stringify(logFormat));
  },
  ACTION_INFO(actionLog: ActionLog): void {
    // 용도: 일반 액션 로그(REQUEST/RESPONSE가 아닌 경우에 대한 로그)
    const logLevel = 'info';

    const logFormat = {
      timestamp: new Date().toISOString(),
      logLevel,
      logPoint: 'ACTION_INFO',
      actionLog,
    };
    logger[logLevel](JSON.stringify(logFormat));
  },
  ACTION_DEBUG(actionLog: ActionLog): void {
    // 용도: 일반 액션 디버그 로그(REQUEST/RESPONSE가 아닌 경우에 대한 로그)
    const logLevel = 'debug';

    const logFormat = {
      timestamp: new Date().toISOString(),
      logLevel,
      logPoint: 'ACTION_DEBUG',
      actionLog,
    };
    logger[logLevel](JSON.stringify(logFormat));
  },
  ACTION_ERROR(actionLog: ActionLog): void {
    // 용도: 일반 액션 디버그 로그(REQUEST/RESPONSE가 아닌 경우에 대한 로그)
    const logLevel = 'error';

    const logFormat = {
      timestamp: new Date().toISOString(),
      logLevel,
      logPoint: 'ACTION_ERROR',
      actionLog,
    };
    logger[logLevel](JSON.stringify(logFormat));
  },
};
