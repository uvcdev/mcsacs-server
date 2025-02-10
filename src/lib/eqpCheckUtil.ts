import { EqpNode } from "./kepServerUtil";
import opcuaClient from "./opcuaUtil";


export const useEqpCheckUtil = () => {

  // 태그 값이 변경 된 eqpNode값을 받는다.
  const eqpTaskStatus = (eqpNode: EqpNode) => {

    console.log("🚀 ~ eqpTaskStatus ~ eqpNode:", eqpNode);
    const { channel, device, tagGroup } = eqpNode;
    // 해당 설비(SC11, SC12)에 해당하는 태그만 뽑아서 쓴다.
    const changedEqpData = opcuaClient.dataState[channel][device][tagGroup];
    console.log("🚀 ~ eqpTaskStatus ~ changedEqpData:", changedEqpData)

  }

  return { eqpTaskStatus }
}

// console.log(eqpNode)
// eqpNode: {
//     channel: 'EQP',
//     device: 'ST01_PLC01',
//     tagGroup: 'SC12',
//     tagName: 'EQ_Code_02'
//   }


// console.log(changedEqpData)
// changedEqpData: {
//     Call_Time_MonthDay: '0000',
//     Call_Time_Year: '2033',
//     EQ_Code_01: '00',
//     EQ_Code_02: '00'
//   }