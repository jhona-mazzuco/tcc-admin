import { MeatTypes } from "../MeatTypes";

export interface ScheduleFormBody {
  fieldId: string;
  date: Date;
  hour: number;
  food: FoodForm | undefined;
}

interface FoodForm {
  peopleNumber: number;
  salad: boolean;
  meatTypes: MeatTypes[];
}
