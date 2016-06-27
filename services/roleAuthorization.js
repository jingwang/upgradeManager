var constants = require('../services/constant.js');
var authorization = {};
authorization[constants.USER_ROLES.SUPER] = [
    constants.PAGE_NAMES.DASHBOARD,
    constants.PAGE_NAMES.UPGRADE,
    constants.PAGE_NAMES.CREATE_USER,
    constants.PAGE_NAMES.MANAGE_USERS,
    constants.PAGE_NAMES.UPDATE_USER_PROFILE
];
authorization[constants.USER_ROLES.ADMIN] = [
    constants.PAGE_NAMES.DASHBOARD,
    constants.PAGE_NAMES.UPGRADE,
    constants.PAGE_NAMES.CREATE_USER,
    constants.PAGE_NAMES.MANAGE_USERS,
    constants.PAGE_NAMES.UPDATE_USER_PROFILE
];
authorization[constants.USER_ROLES.USER] = [
    constants.PAGE_NAMES.DASHBOARD,
    constants.PAGE_NAMES.UPDATE_USER_PROFILE
];
exports.roleAuthorization = authorization;
