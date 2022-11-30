import { FoodTypes } from "../types/FoodTypes";

export interface ScheduleFormBody {
  fieldId: string;
  date: Date;
  hour: number;
  food: FoodForm | undefined;
}

interface FoodForm {
  peopleNumber: number;
  foodTypes: FoodTypes[];
  obs: string;
}
