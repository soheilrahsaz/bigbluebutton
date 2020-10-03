package org.bigbluebutton.core.apps.hamkelasi

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.apps.{ RightsManagementTrait }

trait RequestHamkelasiActionCmdMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleRequestHamkelasiActionCmdMsg(msg: RequestHamkelasiActionCmdMsg) {

    /*def build(meetingId: String, requesteeUserId: String, action: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, requesteeUserId)
      val envelope = BbbCoreEnvelope(RequestHamkelasiActionEvtMsg.NAME, routing)
      val body = RequestHamkelasiActionEvtMsgBody(requesteeUserId, action)
      val header = BbbClientMsgHeader(RequestHamkelasiActionEvtMsg.NAME, meetingId, requesteeUserId)
      val event = RequestHamkelasiActionEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    log.info("Request Hamkelasi action.  meetingId=" + props.meetingProp.intId + " requesteeUserId=" + msg.body.requesteeUserId + " action=" + msg.body.action)
    val event = build(props.meetingProp.intId, msg.body.requesteeUserId, msg.body.action)
    outGW.send(event)*/
  }
}
