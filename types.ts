
export interface Question {
  id: string;
  text: string;
}

export interface Indicator {
  id:string;
  title: string;
  questions: Question[];
}

export interface Section {
  id: string;
  title: string;
  indicators: Indicator[];
}

export interface Dimension {
  id: string;
  title: string;
  color: string;
  sections: Section[];
}

export enum AnswerValue {
  Applies = 'applies',
  Partially = 'partially',
  NotApplies = 'not_applies',
  NotRelevant = 'not_relevant',
}

export const answerOptions = [
    { value: AnswerValue.Applies, label: 'Trifft zu' },
    { value: AnswerValue.Partially, label: 'Trifft teilweise zu' },
    { value: AnswerValue.NotApplies, label: 'Trifft nicht zu' },
    { value: AnswerValue.NotRelevant, label: 'Nicht relevant / Weiss nicht' },
];


export type Answers = Record<string, Record<string, AnswerValue>>;