export enum SlideType {
  TITLE = 'TITLE',
  CONTENT_LIST = 'CONTENT_LIST',
  TWO_COLUMN = 'TWO_COLUMN',
  GRID_FOUR = 'GRID_FOUR',
  QUOTE = 'QUOTE',
}

export interface SlideData {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  content: string[];
  footer?: string;
}

export const INITIAL_SLIDES: SlideData[] = [
  {
    id: '1',
    type: SlideType.TITLE,
    title: '모둠 소개 및 프로젝트 명',
    subtitle: 'LimeFlow: 협업으로 완성하는 시너지',
    content: ['팀원 역할 소개', '프로젝트 아이덴티티', '우리의 비전'],
  },
  {
    id: '2',
    type: SlideType.GRID_FOUR,
    title: '목표와 공동 작업',
    subtitle: '우리가 함께 달성하고자 하는 핵심 목표',
    content: [
      '명확한 목표 설정: 프로젝트의 방향성 제시',
      '실시간 협업: 아이디어의 즉각적인 공유',
      '공동의 성장: 서로 배우며 함께 발전',
      '결과 도출: 팀워크를 통한 완성도 높은 산출물'
    ],
  },
  {
    id: '3',
    type: SlideType.QUOTE,
    title: '협업의 가치',
    subtitle: 'Teamwork makes the dream work',
    content: [
      '개인의 한계를 넘어, 집단의 지성으로.'
    ],
  },
  {
    id: '4',
    type: SlideType.TWO_COLUMN,
    title: '프로젝트 실행 계획',
    subtitle: '단계별 진행 과정 및 세부 전략',
    content: [
      '1단계: 주제 선정 및 자료 조사',
      '2단계: 슬라이드 구조 기획 및 역할 분담',
      '3단계: 공동 편집 및 디자인 고도화',
      '4단계: 최종 리허설 및 피드백 반영'
    ],
  },
];