const { Router } = require('express');
const router = Router();
const logoutController = require('../controllers/logout');


router.get('/', logoutController.get);



module.exports = router;