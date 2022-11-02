import { Request, Response } from "express";
import { firestore } from "firebase-admin";
import { COLLECTION_PATHS } from "../constants/collection-paths";
import { FIELD_RESPONSE_MESSAGE } from "../constants/field-response-message";
import { Field } from "../models/Field";
import { ResponseError } from "../models/ResponseError";
import { ResponseMessage } from "../models/ResponseMessage";

class FieldController {
  async create(req: Request, res: Response) {
    const { name, description, config } = req.body as Field;
    try {
      const fieldsCollection = firestore().collection(COLLECTION_PATHS.FIELDS);
      const { id } = await fieldsCollection.add({ name, description });
      const fieldConfigCollection = firestore()
        .collection(COLLECTION_PATHS.FIELD_CONFIG);
      await fieldConfigCollection.add({ ...config, fieldId: id });
      res.status(200).json({ id });
    } catch (e) {
      res
        .status(500)
        .send(new ResponseError());
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res
        .status(412)
        .send(new ResponseError(FIELD_RESPONSE_MESSAGE.FIELD_NOT_FOUNDED, 412));
    }

    const { name, description, config } = req.body as Field;
    try {
      await firestore()
        .collection(COLLECTION_PATHS.FIELDS)
        .doc(id)
        .update({ name, description });

      const fieldConfigCollection = firestore()
        .collection(COLLECTION_PATHS.FIELD_CONFIG);

      const fieldConfig = await fieldConfigCollection
        .where('fieldId', '==', id)
        .get();

      await fieldConfigCollection
        .doc(fieldConfig.docs[0].id)
        .update({ ...config });

      res.status(200).json({ id });
    } catch (e) {
      res
        .status(500)
        .send(new ResponseError());
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await firestore()
        .collection(COLLECTION_PATHS.FIELDS)
        .doc(id)
        .delete();

      const fieldConfigCollection = firestore()
        .collection(COLLECTION_PATHS.FIELD_CONFIG);

      const configQuery = await fieldConfigCollection
        .where('fieldId', '==', id)
        .get();

      await fieldConfigCollection
        .doc(configQuery.docs[0].id)
        .delete();

      res.send(new ResponseMessage(FIELD_RESPONSE_MESSAGE.REMOVE_SUCCESS));
    } catch (e) {
      res.status(500).send(new ResponseError());
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const fields = await firestore()
        .collection(COLLECTION_PATHS.FIELDS)
        .get();
      res.send(fields.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).send(new ResponseError());
    }
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const field = await firestore()
        .collection(COLLECTION_PATHS.FIELDS)
        .doc(id)
        .get();

      const config = await firestore()
        .collection(COLLECTION_PATHS.FIELD_CONFIG)
        .where('fieldId', '==', id)
        .get();

      res.send({
        ...field.data(),
        config: config.docs[0].data(),
      });
    } catch (e) {
      res.status(500).send(new ResponseError());
    }
  }
}

export default new FieldController();
