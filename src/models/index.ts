// Models(순서 중요 - references설정 때문)
// common

// import Destination from './common/destination';
import CommonCode from './common/commonCode';
import User from './common/user';
import TokenHistory from './common/tokenHistory';
import File from './common/file';
import EventHistory from './common/eventHistory';

// dashboard
import DailyStatistic from './dashboard/dailyStatistic';
import MonthlyStatistic from './dashboard/monthlyStatistic';

// operation
import Facility from './operation/facility';

export * from './sequelize';

const db = {
  /* common */
  CommonCode,
  User,
  TokenHistory,
  File,
  EventHistory,
  /* dashboard */
  DailyStatistic,
  MonthlyStatistic,
  /* operation */
  Facility,
};

export type dbType = typeof db;

// 모든 테이블의 관계 설정은 이곳에 한다. (Model파일에 설정할 경우 순환 참조 발생 함)
// 'belongsTo'관계는 반드시 표현할 것

/* common */
