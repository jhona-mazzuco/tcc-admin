import { Request, Response } from "express";
import { auth, firestore } from "firebase-admin";
import { COLLECTION_PATHS } from "../constants/collection-paths";
import { ResponseError } from "../models/ResponseError";
import { ResponseMessage } from "../models/ResponseMessage";

class DashboardController {
  async fetch(req: Request, res: Response) {
    const { date } = req.query;
    try {
      const schedulesCollection = await firestore()
        .collection(COLLECTION_PATHS.SCHEDULES)
        .where('date', '==', date)
        .get();

      const fieldCollection = await firestore()
        .collection(COLLECTION_PATHS.FIELDS)
        .get();

      const configCollection = firestore()
        .collection(COLLECTION_PATHS.FIELD_CONFIG);

      const foodCollection = firestore()
        .collection(COLLECTION_PATHS.FOOD);

      const response = [];
      for (const doc of schedulesCollection.docs) {
        const { fieldId, userId } = doc.data();

        const { name } = fieldCollection
          .docs
          .find(({ id }) => id == fieldId)!.data();

        const configQuery = await configCollection
          .where('fieldId', '==', fieldId)
          .select('price')
          .get();

        const { price } = configQuery.docs[0].data();

        const foodQuery = await foodCollection
          .where('schedulingId', '==', doc.id)
          .get();

        const user = await auth().getUser(userId);

        response
          .push({
            price,
            id: doc.id,
            field: name,
            hasFood: !!foodQuery.docs?.length,
            user: user.displayName ?? user.email,
          });
      }

      res.json(response);
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }

  async getFoodInfo(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { docs } = await firestore()
        .collection(COLLECTION_PATHS.FOOD)
        .where('schedulingId', '==', id)
        .select(
          'foodTypes',
          'obs',
          'peopleNumber',
        )
        .get();

      res.json(docs[0].data());
    } catch (e) {
      res.status(500).send(new ResponseError());
    }
  }

  async cancelSchedule(req: Request, res: Response) {
    try {
      const schedules = await firestore()
        .collection(COLLECTION_PATHS.SCHEDULES)
        .listDocuments();

      const schedule = schedules.find(({ id }) => id === req.params.id);

      const foodQuery = await firestore()
        .collection(COLLECTION_PATHS.FOOD)
        .where('schedulingId', '==', schedule!.id)
        .get();

      await foodQuery.docs[0].ref.delete();

      await schedule!.delete();

      res.send(new ResponseMessage('Horário excluído com sucesso!'));
    } catch (e) {
      res
        .status(500)
        .send(new ResponseError('Não foi possível excluir o horário!'));
    }
  }
}

export default new DashboardController();
