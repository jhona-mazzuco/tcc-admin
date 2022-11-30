import { Request, Response } from "express";
import { firestore } from "firebase-admin";
import * as moment from "moment";
import { COLLECTION_PATHS } from "../constants/collection-paths";
import { DAY_OF_WEEK } from "../constants/day-of-week";
import { SCHEDULE_STATES } from "../constants/schedule-states";
import { SCHEDULING_RESPONSE_MESSAGE } from "../constants/scheduling-response-message";
import { ScheduleFormBody } from "../interfaces/ScheduleFormBody";
import { FieldConfiguration } from "../models/FieldConfiguration";
import { ResponseError } from "../models/ResponseError";
import { ResponseMessage } from "../models/ResponseMessage";
import { RequestSession } from "../types/RequestSession";

class SchedulingController {
  async schedule(req: Request, res: Response): Promise<void> {
    const userId = (req.session as RequestSession).userId;
    const { fieldId, hour, date, food } = req.body as ScheduleFormBody;

    try {
      const schedulesValidationCollection = await firestore()
        .collection(COLLECTION_PATHS.SCHEDULES)
        .where('date', '==', date)
        .where('hour', '==', hour)
        .get();

      if (schedulesValidationCollection.docs.length) {
        res.status(412).send(new ResponseError('Horário indisponível!'));
        return;
      }

      const schedulingCollection = firestore()
        .collection(COLLECTION_PATHS.SCHEDULES);

      const { id } = await schedulingCollection
        .add({ userId, fieldId, hour, date });

      if (food) {
        const foodCollection = firestore().collection(COLLECTION_PATHS.FOOD);

        await foodCollection.add({ ...food, schedulingId: id });
      }

      res
        .status(200)
        .send(new ResponseMessage(SCHEDULING_RESPONSE_MESSAGE.POST_SUCCESS));
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async fetch(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      res
        .status(412)
        .send(new ResponseError('É obrigatório inserir uma data!', 500));
      return;
    }

    if (!id) {
      res
        .status(412)
        .send(new ResponseError('É obrigatório inserir um campo!', 500));
      return;
    }

    const weekDay = moment(`${ date }`).weekday();

    try {
      const config = await firestore()
        .collection(COLLECTION_PATHS.FIELD_CONFIG)
        .where('fieldId', '==', id)
        .get();

      const { startAt, duration, ignoredHours, price } = config
        .docs[0]
        .data() as FieldConfiguration;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const dayOfWeek = DAY_OF_WEEK[weekDay];
      const ignoredHoursOfDay = ignoredHours
        ?.filter(({ day }) => dayOfWeek === day)
        .map(({ hour }) => hour);

      const schedules: number[] = [];

      const hour = `${
        Math.floor(startAt / 60)
          .toLocaleString('pt-br', { minimumIntegerDigits: 2 })
      }:${ Math.floor(startAt % 60)
        .toLocaleString('pt-br', { minimumIntegerDigits: 2 }) }`;

      const initialDate = moment(`2020-01-01 ${ hour }`);
      do {
        if (schedules.length) {
          schedules.push(schedules[schedules.length - 1] + duration);
        } else {
          schedules.push(startAt);
        }

        initialDate.add(duration, 'minute');
      } while (initialDate.date() === 1);

      const collection = await firestore()
        .collection(COLLECTION_PATHS.SCHEDULES)
        .where('date', '==', date)
        .where('fieldId', '==', id)
        .get();
      const scheduled = collection.docs.map((doc) => doc.data());
      const response = [];
      for (const hour of schedules) {
        if (ignoredHoursOfDay?.find((row) => row === hour)) {
          continue;
        }

        response.push({
          price,
          hour,
          status: scheduled?.find((row) => row.hour == hour) ?
            SCHEDULE_STATES.SCHEDULED : SCHEDULE_STATES.FREE,
        });
      }

      res.json(response);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async fetchUserScheduled(req: Request, res: Response): Promise<void> {
    const userId = (req.session as RequestSession).userId;

    try {
      const scheduleCollection = await firestore()
        .collection(COLLECTION_PATHS.SCHEDULES)
        .where('userId', '==', userId)
        .get();

      const fieldCollection = await firestore()
        .collection(COLLECTION_PATHS.FIELDS)
        .get();

      const configCollection = await firestore()
        .collection(COLLECTION_PATHS.FIELD_CONFIG);

      const response = [];
      for (const schedule of scheduleCollection.docs) {
        const { date, hour, fieldId } = schedule.data();

        const { name } = fieldCollection.docs
          .find((row) => row.id === fieldId)!
          .data();

        const configDocs = await configCollection
          .where('fieldId', '==', fieldId)
          .get();

        const { price } = configDocs.docs[0].data();

        response.push({ date, hour, price, field: name });
      }

      res.send(response);
    } catch (e) {
      res.status(500).send(e);
    }
  }
}

export default new SchedulingController();
