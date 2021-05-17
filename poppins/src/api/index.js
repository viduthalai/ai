/* eslint-disable func-names */
import express from 'express';
import answer from './answer';

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res
    .status(200)
    .send(
      (res = {
        status: 'Poppins server is up!!!'
      })
    );
});

router.post('/assistant/:id', answer.get);

//router.post('/alexa/:id', answer.get);

export default router;
