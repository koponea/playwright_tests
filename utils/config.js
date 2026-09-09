require('dotenv').config()

const DEMO_PORTAL_HEADER = process.env.DEMO_PORTAL_HEADER || 'Swag Labs'
const DEMO_PORTAL_URL = process.env.DEMO_PORTAL_URL || 'https://www.saucedemo.com/'
const PORT = process.env.PORT || 3000

const PASSWORD_DEFAULT = process.env.PASSWORD_DEFAULT || 'secret_sauce'
const USERNAME_DEFAULT = process.env.USERNAME_DEFAULT || 'performance_glitch_user'
const USER_NAME_DEFAULT = process.env.USER_NAME_DEFAULT || 'Ä. Håååååland'

const USERNAMES_DEFAULT = process.env.USERNAMES_DEFAULT || 'standard_user locked_out_user problem_user performance_glitch_user error_user visual_user'

module.exports = {
  DEMO_PORTAL_HEADER,
  DEMO_PORTAL_URL,
  PORT,
  PASSWORD_DEFAULT,
  USERNAME_DEFAULT,
  USER_NAME_DEFAULT,
  USERNAMES_DEFAULT,
}
