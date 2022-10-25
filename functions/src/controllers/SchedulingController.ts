import { Request, Response } from "express";
import { firestore } from "firebase-admin";
import { SCHEDULING_RESPONSE_MESSAGE } from
    "../constants/scheduling-response-message";
import { FetchSchedulingParams } from "../interfaces/FetchSchedulingParams";
import { ScheduleFormBody } from "../interfaces/ScheduleFormBody";
import { ResponseError } from "../models/ResponseError";
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

  async fetch(req: Request, res: Response): Promise<void> {
    const { date } = req.query as unknown as FetchSchedulingParams;

    if (!date) {
      res
          .status(412)
          .send(new ResponseError('É obrigatório inserir uma data!', 500));
      return;
    }

    try {
      const collection = firestore().collection('scheduling');
      const query = collection.where('date', '==', date);
      const data = await query.get();
      res.json(data.docs.map((doc) => doc.data()));
    } catch (e) {
      res.status(500).send(e);
    }
  }
}

export default new SchedulingController();
