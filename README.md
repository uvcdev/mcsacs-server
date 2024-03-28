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