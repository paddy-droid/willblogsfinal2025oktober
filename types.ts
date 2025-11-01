
export enum Step {
  TOPIC_INPUT,
  RESEARCH,
  OUTLINE,
  CONTENT_PART_1,
  CONTENT_PART_2,
  CONTENT_PART_3,
  COMPLETED,
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
