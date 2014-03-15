package com.qtamaki.websocket

import scala.collection.mutable.HashSet
import scala.collection.mutable.SynchronizedSet
import javax.servlet.http._
import org.eclipse.jetty.websocket.WebSocket
import org.eclipse.jetty.websocket.WebSocketServlet
import org.eclipse.jetty.websocket.WebSocket.Connection
import org.eclipse.jetty.websocket.WebSocket.OnTextMessage
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class FireworksServlet extends WebSocketServlet {
  val logger = LoggerFactory.getLogger(classOf[FireworksServlet]);
  val clients = new HashSet[FireworksWebSocket] with SynchronizedSet[FireworksWebSocket]
  var started = false
  val random = new scala.util.Random
  val scores = new HashSet[Int]

  override def doGet(req: HttpServletRequest, resp: HttpServletResponse): Unit = {
    logger.info(">> doGet")
    getServletContext.getNamedDispatcher("default").forward(req, resp)
  }

  override def doWebSocketConnect(req: HttpServletRequest, protocol: String): FireworksWebSocket = {
    logger.info(">> doWebSocketConnect")
    new FireworksWebSocket
  }

  class FireworksWebSocket extends WebSocket.OnTextMessage {

    var connection: Connection = _
    var playerName: Option[String] = None;

    private def sendMessage(clients: HashSet[FireworksWebSocket], data: String) {
      logger.info(">> sendMessage: " + data)
      clients.foreach { c =>
        try { c.connection.sendMessage(data) } catch { case e: Exception => logger.error(e.toString); }
      }
    }
    private def start {
      started = true
      scores.clear()
    }
    private def reset {
      started = false
    }
    override def onMessage(data: String) = {
      logger.info(">> onMessage: " + data)
      clients.synchronized {
        data.split(",").toList match {
          case "OPEN" :: playerName :: _ => {
            sendMessage(clients, data)
            this.playerName = Some(playerName)
            // clientが2名以上で、すべて名前が登録されていれば、プレイ開始とする
            logger.info("started " + started.toString + " clients: " + clients.map(_.playerName))
            if (!started && clients.size > 1 && clients.map(_.playerName).forall(_.isDefined)) {
              start
              // 開始メッセージを投げる
              sendMessage(clients, (("START" :: clients.map(_.playerName.get).toList) ++ (random.nextInt().toString :: Nil)).mkString(","))
            }
          }
          case "FW" :: name :: frame :: x :: y :: _ => {
            if (started) {
              if (scores.contains(frame.toInt)) {
                // do nothing...
              } else {
                scores.add(frame.toInt)
                sendMessage(clients, data)
              }
            }
          }
          case "RESET" :: _ => {
            reset
            sendMessage(clients, data)
          }
          case _ => sendMessage(clients, data)
        }
      }
      logger.info("<< onMessage")
    }

    override def onOpen(connection: Connection) = {
      logger.info(">> onOpen")
      FireworksWebSocket.this.connection = connection
      clients add FireworksWebSocket.this
    }

    override def onClose(closeCode: Int, message: String) = {
      logger.info(">> onClose")
      clients remove FireworksWebSocket.this
      reset
    }
  }
}

