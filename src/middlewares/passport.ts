import { Strategy, type StrategyOptions, ExtractJwt } from 'passport-jwt';
import { User } from '../models';

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

export default new Strategy(opts, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user !== null) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    console.log(error);
  }
});
