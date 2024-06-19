# flexing-mcs-server

- `용도`: mcs-server
- `node버전`: node 18

# 업데이트 내역

## v0.0.1

- 기존 코드 삭제 및 초기 세팅

## v0.0.1-cyk

- facilityGroup, facility 입력/수정시 acs에도 동일하게 입력
- 알람 보관 주기 등록/수정 기능(로그 삭제 기능 포함)
- 작업지시 생성
  - `regWorkOrder` 통해 acs에도 작업지시 생성
  - 품목 없는 경우 품목 생성
  - 작업지시 코드 중복 제거
- 설비관리 검색조건 추가
  - 타입, 활성화
- 비밀번호 단순화 `hashUtil` (최소4자리)

## v0.0.2

- 버전승인: `v0.0.1-cyk`

## v0.0.2-cyk

- 설비 관리
  - 검색조건 일치하는 컬럼 추가(`uniqueName`)
- 설비그룹 관리
  - 검색조건 일치하는 컬럼 추가(`uniqueName`)
  - 설비그룹 코드 자동 채번 및 숨기기

## v0.0.3

- 버전승인: `v0.0.2-cyk`

## v0.0.3-cyk

- MCS에서 acs/logging mqtt 메세지 받아서 로그 저장
  (`itemLogDao`, `itemLogModel`, `mqttUtil`)

## v0.0.4

- itemLog 저장 방식 수정(토픽변경 등)

- facility에 zoneId, dockingZoneId 컬럼 삭제

```sql
ALTER TABLE public.facilities DROP CONSTRAINT facilities_zone_id_fkey;
ALTER TABLE public.facilities DROP COLUMN zone_id;
ALTER TABLE public.facilities DROP COLUMN docking_zone_id;
```

## v0.0.4-cyk

- iMCS 전용 insert 파라미터 추가(`ImcsWorkOrderInsertParams`)
- workOrder 등록 로직 수정(`regWorkOrder`)
- workOrder 테이블 수정
  - workroder.itemcode 컬럼 및 외래키 추가

```sql
ALTER TABLE public.work_orders ADD item_code varchar(255) NULL;
ALTER TABLE public.work_orders ADD CONSTRAINT work_orders_fk FOREIGN KEY (item_code) REFERENCES public.items(code) ON DELETE SET NULL ON UPDATE CASCADE;
```

## v0.0.5

- 버전승인: `v0.0.4-cyk`

## v0.0.6

- 작업취소 추가
