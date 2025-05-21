declare namespace Express {
  export interface Request {
    rawBody?: Buffer; // Или string, если вы уверены, что bodyParser.text() всегда вернет строку
  }
}