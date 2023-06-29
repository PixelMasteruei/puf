import express from 'express';

import session from '../../core/session';
import passport from '../../core/passport';
import User from '../../data/User';

import me from './me';
import auth from './auth';
import chatHistory from './chathistory';
import startDm from './startdm';
import leaveChan from './leavechan';
import block from './block';
import blockdm from './blockdm';
import privatize from './privatize';
import modtools from './modtools';
import baninfo from './baninfo';
import getiid from './getiid';
import shards from './shards';
import banme from './banme';

const router = express.Router();

// set cache-control
router.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Expires: '0',
  });
  next();
});

router.use(express.json());

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  res.status(400).json({
    errors: [{ msg: 'Invalid Request' }],
  });
});

// routes that don't need a user
router.get('/baninfo', baninfo);
router.get('/getiid', getiid);
router.get('/shards', shards);

/*
 * get user session
 */
router.use(session);

/*
 * at this point we could use the session id to get
 * stuff without having to verify the whole user,
 * which would avoid SQL requests
*/

/*
 * passport authenticate
 * and deserialize
 * (makes that sql request to map req.user.regUser)
 * After this point it is assumes that user.regUser is set if user.id is too
 */
router.use(passport.initialize());
router.use(passport.session());

/*
 * modtools
 * (does not take urlencoded bodies)
 */
router.use('/modtools', modtools);

/*
 * create unregistered user by request if
 * not logged in
 */
router.use(async (req, res, next) => {
  if (!req.user) {
    req.user = new User(req);
  }
  next();
});

router.get('/chathistory', chatHistory);

router.get('/me', me);

router.use('/auth', auth);

router.post('/banme', banme);

router.use((req, res, next) => {
  if (!req.user.isRegistered) {
    next(new Error('You are not logged in'));
    return;
  }
  next();
});

/*
 * require registered user after this point
 */

router.post('/startdm', startDm);

router.post('/leavechan', leaveChan);

router.post('/block', block);

router.post('/blockdm', blockdm);

router.post('/privatize', privatize);

/*
 * error handling
 */

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  res.status(400).json({
    errors: [err.message],
  });
});

export default router;
