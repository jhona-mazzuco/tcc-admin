import { Request, Response } from "express";
import { firestore } from "firebase-admin";
import { SCHEDULING_RESPONSE_MESSAGE }
  from "../constants/scheduling-response-message";
import { ScheduleFormBody } from "../interfaces/ScheduleFormBody";
import { RequestSession } from "../types/RequestSession";

class SchedulingController {
  async schedule(req: Request, res: Response): Promise<void> {
    const userId = (req.session as RequestSession).userId;
    const { fieldId, hour, date, food } = req.body as ScheduleFormBody;

    try {
      const schedulingCollection = firestore().collection('scheduling');

      const { id } = await schedulingCollection
          .add({ userId, fieldId, hour, date });

      if (food) {
        const foodCollection = firestore().collection('food');

        await foodCollection.add({ ...food, schedulingId: id });
      }

      res.status(200).send(SCHEDULING_RESPONSE_MESSAGE.POST_SUCCESS);
    } catch (e) {
      res.status(500).send(e);
    }
  }
}

export default new SchedulingController();
