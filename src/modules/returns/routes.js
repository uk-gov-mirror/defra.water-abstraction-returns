const returnsApi = require('./returns');
const versionsApi = require('./versions');
const linesApi = require('./lines');
const voidReturnsController = require('./void-returns');
const deleteReturnsController = require('./delete-returns');
const Joi = require('joi');

const voidReturns = {
  method: 'PATCH',
  handler: voidReturnsController.patchVoidReturns,
  path: '/returns/1.0/void-returns',
  config: {
    description: 'For the given licence and valid return ids, marks other returns as void',
    validate: {
      payload: {
        licenceNumber: Joi.string().required(),
        licenceType: Joi.string().required(),
        regime: Joi.string().required(),
        validReturnIds: Joi.array().items(Joi.string())
      }
    }
  }
};

const deleteReturn = {
  method: 'DELETE',
  handler: deleteReturnsController.deleteReturnById,
  path: '/returns/1.0/return/{returnId}',
  config: {
    description: 'Delete a return based on the return identifier',
    validate: {
      params: {
        returnId: Joi.string().required()
      }
    }
  }
};

module.exports = [
  ...returnsApi.getRoutes(),
  ...versionsApi.getRoutes(),
  ...linesApi.getRoutes(),
  voidReturns,
  deleteReturn
];
