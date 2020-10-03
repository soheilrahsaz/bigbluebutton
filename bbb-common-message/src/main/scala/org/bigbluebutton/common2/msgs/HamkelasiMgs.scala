package org.bigbluebutton.common2.msgs

/**
 * Sent from client to request Hamkelasi action.
 */
object RequestHamkelasiActionCmdMsg { val NAME = "RequestHamkelasiActionCmdMsg" }
case class RequestHamkelasiActionCmdMsg(header: BbbClientMsgHeader, body: RequestHamkelasiActionCmdMsgBody) extends StandardMsg
case class RequestHamkelasiActionCmdMsgBody(requesteeUserId: String, action: String)

/**
 * Send Hamkelasi action to client.
 */
object RequestHamkelasiActionEvtMsg { val NAME = "RequestHamkelasiActionEvtMsg" }
case class RequestHamkelasiActionEvtMsg(header: BbbClientMsgHeader, body: RequestHamkelasiActionEvtMsgBody) extends BbbCoreMsg
case class RequestHamkelasiActionEvtMsgBody(requesteeUserId: String, action: String)