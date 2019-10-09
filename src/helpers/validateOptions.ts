import joi from 'joi';

const generomiseDataSchema = joi.array().items(joi.object({
  handler: joi.func().required(),
  after: joi.array().items(joi.string()),
  id: joi.string().required(),
  type: joi.string().valid(['error', 'success'])
}));

export function validateData(options: any) {
  const { error } = generomiseDataSchema.validate(options);
  if ( error ) {
    throw new Error(error.toString());
  }
}
