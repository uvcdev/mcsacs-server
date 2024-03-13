/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { logging } from '../lib/logging';
import mqtt, { IClientOptions } from 'mqtt';
import * as dotenv from 'dotenv';
dotenv.config();

import { service as workOrderService } from '../service/operation/workOrderService';

// mqtt접속 환경
type MqttConfig = {
  host: string;
  port: number;
  topic: string;
};

const mqttConfig: MqttConfig = {
  host: process.env.MQTT_HOST || '',
  port: Number(process.env.MQTT_PORT || '1883'),
  topic: process.env.MQTT_TOPIC || 'mcs',
};

export enum MqttTopics {
  WorkerStatus = 'feedback_worker_status',
  WorkHistory = 'work_history',
  Docking = 'docking',
  AlarmRegist = 'alarm/regist',
  AlarmClear = 'alarm/clear',
  IsAlive = 'is-alive',
}

// broker에 접속될 클라이언트 아이디(unique필요)
const clientId = 'mcs_' + Math.random().toString(16).substr(2, 8);

const options: IClientOptions = {
  host: mqttConfig.host,
  port: mqttConfig.port,
  clientId: clientId,
};

const client = mqtt.connect(options);
const topic = mqttConfig.topic;

// 10초마다 서버 상태 acs로 보내기
if (mqttConfig.host !== '') {
  setInterval(() => {
    try {
      sendMqtt(`${MqttTopics.IsAlive}`, JSON.stringify(true));
    } catch (error) {
      error;
    }
  }, 10000);
}

// mqtt 연결, 구독, 메세지 수신
export const receiveMqtt = (): void => {
  if (mqttConfig.host !== '') {
    // mqtt host가 등록된 경우에만 구독한다.
    client.on('connect', () => {
      logging.MQTT_LOG({
        title: 'mqtt connect',
        topic,
        message: null,
      });

      // mqtt 구독
      // client.subscribe(`${topic}/#`, (err) => {
      //   logging.MQTT_LOG({
      //     title: 'mqtt subscribe',
      //     topic,
      //     message: null,
      //   });

      //   if (err) {
      //     logging.MQTT_ERROR({
      //       title: 'mqtt subscribe error',
      //       topic,
      //       message: null,
      //       error: err,
      //     });
      //   }
      // });

      // mcs mqtt 구독
      client.subscribe(`imcs/#`, (err) => {
        logging.MQTT_LOG({
          title: 'mqtt subscribe',
          topic,
          message: null,
        });

        if (err) {
          logging.MQTT_ERROR({
            title: 'mqtt subscribe error',
            topic,
            message: null,
            error: err,
          });
        }
      });

      // mcs mqtt 구독
      client.subscribe(`${topic.includes('MCS')}/#`, (err) => {
        logging.MQTT_LOG({
          title: 'mqtt subscribe',
          topic,
          message: null,
        });

        if (err) {
          logging.MQTT_ERROR({
            title: 'mqtt subscribe error',
            topic,
            message: null,
            error: err,
          });
        }
      });
    });

    // 메세지 수신
    client.on('message', (messageTopic, messageOrg) => {
      try {
        const topicSplit = messageTopic.split('/');

        if (topicSplit.length >= 3) {
          const serverTopic = topicSplit[0];
          const logicTopic = topicSplit[1];
          const targetId = topicSplit[2];
          const message = messageOrg.toString();
          logging.MQTT_LOG({
            title: 'receive message',
            topic: messageTopic,
            message: messageOrg.toString(),
          });

          // 1. imcs에서  메세지 처리
          if (serverTopic === 'imcs' && logicTopic === 'notify') {
            const messageJson = JSON.parse(message);
            logging.MQTT_DEBUG({
              title: 'imcs message',
              topic: messageTopic,
              message: messageJson,
            });

            void workOrderService.regWorkOrder(messageJson);
          }
        }
      } catch (err) {
        logging.MQTT_ERROR({
          title: 'mqtt message error',
          topic: messageTopic,
          message: messageOrg.toString(),
          error: err,
        });
      }
    });

    client.on('error', (err) => {
      logging.MQTT_ERROR({
        title: 'mqtt error',
        message: null,
        error: err,
      });
    });
  }
};

// mqtt 메세지 발송
export const sendMqtt = (subTopic: string, message: string): void => {
  if (mqttConfig.host !== '') {
    // mqtt host가 등록된 경우에만 발송한다.
    let sendTopic = topic;
    if (subTopic) {
      sendTopic = topic + '/' + subTopic;
    }

    try {
      client.publish(sendTopic, message);
    } catch (err) {
      logging.MQTT_ERROR({
        title: 'mqtt send error',
        topic: topic,
        message: message,
        error: err,
      });
    }
  }
};
