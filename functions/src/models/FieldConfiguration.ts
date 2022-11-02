import { IgnoredHour } from "../interfaces/IgnoredHour";

export class FieldConfiguration {
  fieldId!: string;
  startAt!: number;
  duration!: number;
  ignoredHours: IgnoredHour[] | undefined;
}
