const { Router } = require('express');
const sign_up_Controller = require('../controllers/sign_up');

const router = Router();

router.get("/", sign_up_Controller.newUserGet);

router.post("/", sign_up_Controller.newUserPost);


module.exports = router;