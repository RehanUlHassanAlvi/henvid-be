// Models index - ensures all models are registered in correct order
import Company from './Company';
import User from './User';
import Session from './Session';
import EmailVerification from './EmailVerification';
import License from './License';
import Subscription from './Subscription';
import Payment from './Payment';
import Review from './Review';
import Comment from './Comment';
import VideoCall from './VideoCall';
import Analytics from './Analytics';
import Addon from './Addon';

export {
  Company,
  User,
  Session,
  EmailVerification,
  License,
  Subscription,
  Payment,
  Review,
  Comment,
  VideoCall,
  Analytics,
  Addon
};

// Ensure models are registered in mongoose
export default {
  Company,
  User,
  Session,
  EmailVerification,
  License,
  Subscription,
  Payment,
  Review,
  Comment,
  VideoCall,
  Analytics,
  Addon
}; 