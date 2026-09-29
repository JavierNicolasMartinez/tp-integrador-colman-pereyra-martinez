// Error con código HTTP: los services lo lanzan y el errorHandler arma la respuesta.
// No depende de Express, así que los services siguen sin conocer req ni res.
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
