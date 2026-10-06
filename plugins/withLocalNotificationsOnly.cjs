const { withEntitlementsPlist } = require('expo/config-plugins');

/**
 * expo-notifications adds aps-environment; Planly only uses local scheduled reminders.
 * Removes push entitlement so App Store provisioning without Push capability still signs.
 */
module.exports = function withLocalNotificationsOnly(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['aps-environment'];
    return cfg;
  });
};
