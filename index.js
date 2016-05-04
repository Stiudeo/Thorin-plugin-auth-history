'use strict';
const initModels = require('./lib/initModels'),
  initHistory = require('./lib/accountHistory');

/**
 * Created by Adrian on 08-Apr-16.
 * This plugin will create a table called by default "account_history",
 * where it will create an entry each time an "auth:history" event is triggered by the dispatcher.
 * By default, all thorin auth plugins will emit the login or the logout/password change events,
 * and this will listen to all.
 */
module.exports = function(thorin, opt, pluginName) {
  opt = thorin.util.extend({
    events: null,       // IF specified, we will only listen for these auth events in the dispatcher. Array of strings
    logger: pluginName || 'auth-history',
    store: 'sql',             // the Thorin SQL Store name to attach the model.
    accountModel: 'account',      // the target SQL model to attach the password field to.
    history: {
      modelName: null,
      tableName: null
    }
  }, opt);
  const logger = thorin.logger(opt.logger);
  if(!opt.history.tableName) {
    opt.history.tableName = opt.accountModel + '_history';
  }
  if(!opt.history.modelName) {
    opt.history.modelName = opt.accountModel + 'History';
  }
  if(!opt.store) {
    logger.fatal('Auth history plugin requires an SQL store.');
    return;
  }

  let pluginObj = {}, loader;
  // Step one: initiate the model.
  thorin.on(thorin.EVENT.INIT, 'store.' + opt.store, (storeObj) => {
    loader = initModels(thorin, storeObj, opt);
    loader.init();
    initHistory(thorin, storeObj, pluginObj, opt);
    // Load all authorizations and middleware.
  });
  pluginObj.setup = function(done) {
    loader.setup();
    done();
  };

  pluginObj.options = opt;

  return pluginObj;
};
module.exports.publicName = 'auth-history';