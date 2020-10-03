import { check } from 'meteor/check';
import startTyping from '../modifiers/requestHamkelasiAction';

export default function handleRequestHamkelasiAction({ body }, meetingId) {
  const { requesterUserId, requesteeUserId, action } = body;

  check(requesterUserId, String);
  check(requesteeUserId, String);
  check(action, Object);

  requestHamkelasiAction(meetingId, requesterUserId, requesteeUserId, action);
}
