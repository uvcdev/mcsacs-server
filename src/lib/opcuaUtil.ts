import {
  UserTokenType,
  OPCUAClient,
  ClientSession,
  ClientSubscription,
  UserIdentityInfoUserName
} from "node-opcua";
import { kepserverConfig } from "../config/kepserverConfig";
import fs from "fs";
import path from "path";
import {
  AttributeIds,
  DataValue,
  ReadValueIdOptions,
  TimestampsToReturn,
  NodeId,
  ClientMonitoredItemBase,
  ClientMonitoredItemGroup
} from "node-opcua-client";
import { logToConsoleAndFile } from './logging';
import { registerClientEvents } from "../events/kepserverClientEvents";
import { registerSubscriptionEvents } from '../events/kepserverSubscriptionEvents';
import {
  Tag,
  loadTags,
  parseWordToAscii,
  extractBitsFromWord,
  checkFormatSize,
  printDataState,
  parseNodeId,
  DataState,
  initializeDataState,
  Subscription
} from './kepServerUtil';
import { useEqpCheckUtil } from './eqpCheckUtil';

const userIdentity: UserIdentityInfoUserName = {
  type: 1,
  userName: process.env.OPCUA_USERNAME || "",
  password: process.env.OPCUA_PASSWORD || "",
};

const opcuaClient = {
  client: OPCUAClient.create(kepserverConfig.clientOptions),
  session: null as ClientSession | null,
  subscription: null as ClientSubscription | null,
  dataState: {} as DataState,
  tagsInfo: null as Tag[] | null,
  observableData: {} as Record<string, any>,
  eqpCheckUtil: useEqpCheckUtil(),

  // KEPServerEx에 연결하는 함수
  async connectToKepserverex(): Promise<void> {
    // 연결 이벤트 등록
    registerClientEvents(this.client);
    try {
      // KEPServerEx에 연결
      console.log('connect request', kepserverConfig.endpointUrl)
      await this.client.connect(kepserverConfig.endpointUrl);
      console.log('connect completed')
      // logToConsoleAndFile("Connected to KepServerEX!", "green");

    } catch (error) {
      console.log('연결할 때 에러')
      // logToConsoleAndFile(`Failed to connect: ${error}`, "red");
    }

  },

  // Session 생성하는 함수
  async createSession(): Promise<void> {

    if (this.session) {
      logToConsoleAndFile("Session already exists!", "yellow");
      return;
    }

    try {
      // session 생성			
      this.session = await this.client.createSession(
        userIdentity.userName !== "" ? userIdentity : { type: UserTokenType.Anonymous }
      );
      logToConsoleAndFile("Created Session!", "green");

    } catch (error) {
      logToConsoleAndFile(`Failed to Create Session: ${error}`, "red");
    }

  },


  // Subscription 생성하는 함수
  async createSubscription() {

    if (this.subscription) {
      logToConsoleAndFile("Subscription already exists!", "yellow");
      return;
    }

    if (!this.session) throw new Error("Session is not initialized!");

    try {
      // Subscription 생성
      this.subscription = ClientSubscription.create(this.session, kepserverConfig.subscribeOptions);

      // Subscription 이벤트 등록
      registerSubscriptionEvents(this.subscription);

    } catch (error) {
      logToConsoleAndFile(`Failed to Create Session: ${error}`, "red");
    }

  },

  // 구독할 태그들 kepserverTag.json에서 읽어와서 구독할 노드 배열 생성 및 dataState변수 초기화
  loadTagsAndCreateSubscriptionNodes(): ReadValueIdOptions[] {
    const subscriptionsPath = path.resolve(__dirname, "../../kepserverTag.json");

    try {
      const fileContent = fs.readFileSync(subscriptionsPath, "utf8");
      const subscriptions: Subscription[] = JSON.parse(fileContent)['subscriptionNodes'];

      // 태그 값들 담아둘 dataState객체 변수 초기화
      this.dataState = initializeDataState(subscriptions);

      return subscriptions.map((node: Subscription) => ({
        nodeId: node.nodeId,
        attributeId: AttributeIds.Value,
      }));

    } catch (error) {
      logToConsoleAndFile(`Failed to load tags from ${subscriptionsPath}: ${error}`, "red");
      throw error;
    }
  },

  // 모니터링 할 노드 등록
  async monitorSubscriptionNodes(subscriptionNodes: ReadValueIdOptions[]): Promise<void> {

    if (!this.subscription) {
      logToConsoleAndFile("Subscription is not initialized!", "red");
      return;
    }

    try {
      // 태그 정보들 불러오기
      this.tagsInfo = await loadTags("eqpConfig.json");

      // 모니터링 등록록
      const monitoredItems = await this.subscription.monitorItems(
        subscriptionNodes,
        { samplingInterval: 500, discardOldest: true, queueSize: 10 },
        TimestampsToReturn.Both
      );

      // 'on.changed' 이벤트 등록
      this.registerChangeEvent(monitoredItems);


    } catch (error) {
      logToConsoleAndFile(`Failed to monitor subscription nodes: ${error}`, "red");
      throw error;
    }
  },

  // 'on.changed' 이벤트 등록 함수
  registerChangeEvent(monitoredItems: ClientMonitoredItemGroup): void {

    monitoredItems.on("changed", (monitoredItem: ClientMonitoredItemBase, dataValue: DataValue) => {

      try {

        const nodeId = monitoredItem.itemToMonitor.nodeId.value.toString();
        const value = dataValue.value.value;

        logToConsoleAndFile(`Changed Tag Data\nNodeId: ${nodeId}, Value: ${value}`, "important");

        this.processMonitoredData(nodeId, value);

        // 변경된 노드값 console로 출력해보는 함수수
        printDataState();

      } catch (error) {
        logToConsoleAndFile(`Error handling changed event: ${error}`, "red");
      }

    });
  },

  // 변경된 태그 데이터 값 처리
  processMonitoredData(nodeId: string, value: any): void {

    let targetTagInfo = null;

    // nodeId를 통해 channel, device, tag_group, tag명을 나눠서 유추하는 함수
    // nodeId = EQP.ST01_PLC01.SC11.EQ_Code_02
    // channel = EQP
    // device = ST01_PLC01
    // tagGroup = SC11
    // tag = EQ_Code_02
    const eqpNode = parseNodeId(nodeId);

    if (!eqpNode) {

      const errorMessage = `Invalid Node ID format detected: "${nodeId}". Unable to process the provided value: "${value}".`;
      logToConsoleAndFile(errorMessage, "yellow");
      throw new Error(errorMessage);
    }

    const { channel, device, tagGroup, tagName } = eqpNode;

    if (this.tagsInfo) {
      targetTagInfo = this.tagsInfo.find((tag) => tag.TAG_NAME === tagName);
    }

    if (!targetTagInfo) {

      const errorMessage = `No Tag found with name: ${nodeId}, ${value}`;
      logToConsoleAndFile(errorMessage, "yellow");
      throw new Error(errorMessage);
    }

    switch (targetTagInfo.INPUT_TYPE) {
      case "ASCII":
        this.dataState[channel][device][tagGroup][tagName] = parseWordToAscii(value);
        break;
      case "PDEC":
        if (targetTagInfo.CHILD_TAGS) {
          const results = extractBitsFromWord(value, targetTagInfo.CHILD_TAGS);
          results.forEach((result) => {
            this.dataState[channel][device][tagGroup][result.tagName] = result.value;
          });
        } else {
          console.log(`No CHILD_TAGS with name: ${nodeId}`);
        }
        break;
      case "DEC":
        this.dataState[channel][device][tagGroup][tagName] = checkFormatSize(value, targetTagInfo);
        break;
      case "BIT":
        this.dataState[channel][device][tagGroup][tagName] = value;
        break;
      default:
        logToConsoleAndFile(`Unhandled type for nodeId:: ${nodeId}, ${value}`, "yellow");
        break;
    }


    // // 변경된 데이터 값을 토대로 실행할 ACS의 fmsCheckUtil.ts 같은 함수
    this.eqpCheckUtil.eqpTaskStatus(eqpNode);

  },


  async initKepserverex(): Promise<void> {

    try {
      // KEPServerEx에 연결
      await this.connectToKepserverex();

      // Session 생성
      await this.createSession();

      // Subscription 생성
      await this.createSubscription();

      // 모니터링 할 노드 목록 불러오기
      const subscriptionNodes = this.loadTagsAndCreateSubscriptionNodes();
      console.log("🚀 ~ initKepserverex ~ subscriptionNodes:", subscriptionNodes)

      // 모니터링 할 노드 등록하고 'on.change' 이벤트 등록하기
      // await this.monitorSubscriptionNodes(subscriptionNodes);

    } catch (error) {

      logToConsoleAndFile(`Error during initKepserverex: ${error}`, "red");
      throw error;

    }
  }


};

export default opcuaClient;