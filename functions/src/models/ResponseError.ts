export class ResponseError {
  message: string;
  status: number;

  constructor(message = 'Ocorreu um erro inesperado!', status = 500) {
    this.message = message;
    this.status = status;
  }
}
