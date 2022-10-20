import { Request, Response } from "express";
import { firestore, storage } from "firebase-admin";
import { Field } from "../models/Field";

class FieldController {
  async create(req: Request, res: Response) {
    const { name, description, images, config } = req.body as Field;
    try {
      const fieldsCollection = firestore().collection('fields');
      const { id } = await fieldsCollection.add({ name, description });
      const fieldConfigCollection = firestore().collection('field_config');
      await fieldConfigCollection.add({ ...config, fieldId: id });
      const imagesBucket = storage()
        .bucket('field_images');
      for (const name of images) {
        const file = storage().bucket('field_temp')
          .file(name);

        await file.copy(imagesBucket);

        await file.delete();
      }

      res.status(200).send();
    } catch (e) {
      res.status(500).send(e);
    }
  }
}

export default new FieldController();
