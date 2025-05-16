import Joi from "joi";

export const addProductValidator = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    category: Joi.string().required(),
    // image: Joi.string().required(), 
});

