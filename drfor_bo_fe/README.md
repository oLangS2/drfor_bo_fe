# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# 설치
npm create vite@latest

## react 버전으로 설치가 안될경우 
- --legacy-peer-deps
- ex) npm install --legacy-peer-deps
## 1. Dependencies: 프로덕션 코드에서 사용되는 패키지들입니다.
### 기본
- react: React 라이브러리로, UI 컴포넌트를 만들고 관리하는 데 사용됩니다.
- react-dom: React 컴포넌트를 DOM에 렌더링하기 위한 패키지입니다.
### 추가 설치
- suneditor: SunEditor의 Core 라이브러리. 다양한 기능을 제공하는 웹 기반 WYSIWYG 에디터
- suneditor-react: SunEditor의 React 버전. React 프로젝트에서 사용되는 에디터.
- react-router-dom: React 애플리케이션에서 라우팅을 관리하기 위한 라이브러리입니다.
- react-helmet: React에서 페이지의 head 태그를 쉽게 관리할 수 있는 라이브러리 (메타데이터 관리용)
- axios: HTTP 요청을 보내기 위한 라이브러리로, 주로 API 호출 시 사용됩니다.
- chart.js: 다양한 차트를 그릴 수 있는 JavaScript 라이브러리입니다. react-chartjs-2와 함께 사용됩니다.
- react-chartjs-2: chart.js를 React 컴포넌트로 사용할 수 있게 해주는 라이브러리입니다.
- react-datepicker: 날짜 선택을 위한 React 컴포넌트 라이브러리입니다.
- date-fns: 날짜와 시간을 다루기 위한 유틸리티 함수들을 제공하는 라이브러리입니다. 날짜 포맷팅, 비교 등의 작업을 쉽게 할 수 있습니다.
- react-sortablejs: 드래그 앤 드롭을 통한 정렬 기능을 제공하는 sortablejs의 React 버전입니다.
- recoil: React의 상태 관리를 위해 사용되는 라이브러리로, 컴포넌트 간에 상태를 쉽게 공유할 수 있게 합니다.
- recoil-persist: Recoil 상태를 로컬 스토리지에 저장해 애플리케이션을 재시작할 때도 상태를 유지할 수 있게 해주는 라이브러리입니다.
- sortablejs: 리스트를 드래그 앤 드롭으로 정렬할 수 있게 해주는 라이브러리입니다.
- swiper: 슬라이드 기능을 구현할 수 있는 라이브러리로, 다양한 애니메이션과 기능을 제공합니다.
- exceljs: Excel 파일을 생성하고 수정할 수 있는 라이브러리입니다. 주로 데이터를 Excel로 내보낼 때 사용됩니다.
- file-saver: 브라우저에서 파일을 저장할 수 있게 해주는 라이브러리입니다. 예를 들어, exceljs로 생성한 Excel 파일을 다운로드할 때 사용됩니다.
- react-highlight: 소스강조 하이라이트 플러그인 입니다.

## 2. DevDependencies: 개발 환경에서만 사용되는 패키지들입니다.
### 기본
- eslint: JavaScript 코드에서 스타일과 오류를 검토하기 위한 도구입니다.
- eslint-plugin-react: React 코드에서 ESLint 규칙을 적용할 수 있게 해주는 플러그인입니다.
- eslint-plugin-react-hooks: React Hooks 사용 시 ESLint 규칙을 추가로 적용할 수 있게 해주는 플러그인입니다.
- eslint-plugin-react-refresh: React Fast Refresh를 사용할 때 ESLint 규칙을 적용할 수 있게 해주는 플러그인입니다.
- sass: CSS의 확장 언어인 Sass를 컴파일하기 위한 라이브러리입니다. CSS를 더 쉽게 작성할 수 있게 도와줍니다.
- vite: 빠르고 가벼운 개발 서버 및 빌드 도구입니다. React 애플리케이션의 빠른 빌드를 지원합니다.
- @types/react: TypeScript에서 React를 사용할 때 타입 정의를 제공하는 패키지입니다.
- @types/react-dom: TypeScript에서 React DOM을 사용할 때 타입 정의를 제공하는 패키지입니다.
- @vitejs/plugin-react: Vite와 React를 통합하기 위한 플러그인입니다. React 코드의 빠른 컴파일과 HMR(Hot Module Replacement)을 지원합니다.