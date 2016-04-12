'use strict';
/**
 * Created by Adrian on 11-Apr-16.
 */
const historyModelInit = require('./model/history');
module.exports = function(thorin, storeObj, opt) {

  const loader = {};
  const logger = thorin.logger(opt.logger);

  let shouldSyncModelHistory = false;

  /*
  * initialize the models.
  * */
  loader.init = function() {
    let AccountModel = storeObj.model(opt.accountModel);
    if (!AccountModel) {
      logger.fatal('SQL store does not have auth model: ' + opt.accountModel);
      return false;
    }

    // Check if we have to create the login history
    if (opt.history && !storeObj.model(opt.history.modelName)) {
      shouldSyncModelHistory = true;
      let historyFn = historyModelInit(thorin, opt, AccountModel);
      storeObj.addModel(historyFn, {
        code: opt.history.modelName
      });
    }
  };

  /*
  * Setup the DB
  * */
  loader.setup = function() {
    logger.info('Setting up db models once store %s is running', storeObj.name);
    thorin.on(thorin.EVENT.RUN, 'store.' + storeObj.name, () => {
      let syncs = [];
      syncs.push(() => {
        return storeObj.sync(opt.history.modelName);
      });
      thorin.series(syncs, (err) => {
        if(err) {
          logger.error('Failed to sync db models.', err);
        }
      });
    });
  };
  return loader;
};