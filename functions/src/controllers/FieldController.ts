import { Request, Response } from "express";
import { firestore, storage } from "firebase-admin";
import { BUCKET_PATHS } from "../constants/bucket-paths";
import { COLLECTION_PATHS } from "../constants/collection-paths";
import { Field } from "../models/Field";
import { ResponseError } from "../models/ResponseError";
import { ResponseMessage } from "../models/ResponseMessage";

class FieldController {
  async create(req: Request, res: Response) {
    const { name, description, images, config } = req.body as Field;
    try {
      const fieldsCollection = firestore().collection(COLLECTION_PATHS.FIELDS);
      const { id } = await fieldsCollection.add({ name, description });
      const fieldConfigCollection = firestore()
        .collection(COLLECTION_PATHS.FIELD_CONFIG);
      await fieldConfigCollection.add({ ...config, fieldId: id });

      const tempBucket = storage().bucket(BUCKET_PATHS.FIELD_TEMP);
      const bucket = storage().bucket(BUCKET_PATHS.FIELD_IMAGES);
      for (const name of images) {
        const file = tempBucket.file(name);
        await file.move(bucket);
        await bucket.file(name).move(`${ id }/${ name }`);
      }
      res.status(200).json({ id });
    } catch (e) {
      console.log(e);
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
        .send(new ResponseError('Nenhum campo encontrado!', 412));
    }

    const { name, description, images, config } = req.body as Field;
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


      const tempBucket = storage().bucket(BUCKET_PATHS.FIELD_TEMP);
      const bucket = storage().bucket(BUCKET_PATHS.FIELD_IMAGES);
      for (const name of images) {
        const file = tempBucket.file(name);
        await file.move(bucket);
        await bucket.file(name).move(`${ id }/${ name }`);
      }
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

      await storage()
        .bucket(BUCKET_PATHS.FIELD_IMAGES)
        .deleteFiles({ prefix: `${id}/` });

      res.send(new ResponseMessage('Campo excluído com sucesso!'));
    } catch (e) {
      res.status(500).send(new ResponseError());
    }
  }

  async deleteImage(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;
    try {
      const bucket = storage().bucket(BUCKET_PATHS.FIELD_IMAGES);
      const file = await bucket.file(`${ id }/${ name }`);
      await file.delete();
      res.send(new ResponseMessage('Imagem excluída com sucesso!'));
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

      const bucket = storage()
        .bucket(BUCKET_PATHS.FIELD_IMAGES);

      const filesResponse = await bucket
        .getFiles({ prefix: `${ id }/` });

      const images = [];
      for (const { metadata } of filesResponse[0]) {
        const data = {
          name: metadata.name.split('/')[1],
          url: await bucket.file(metadata.name).getSignedUrl({
            action: 'read',
            expires: '2100-01-01',
          }),
        };

        images.push(data);
      }

      res.send({
        ...field.data(),
        config: config.docs[0].data(),
        images,
      });
    } catch (e) {
      console.log(e);
      res.status(500).send(new ResponseError());
    }
  }
}

export default new FieldController();
