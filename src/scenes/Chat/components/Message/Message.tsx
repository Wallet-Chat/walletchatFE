import { formatMessageDate } from '../../../../helpers/date'
import { MessageUIType } from '../../../../types/MessageUI'

const Message = ({ msg }: { msg: MessageUIType }) => {

   return (
      <div className={`msg ${msg.position}-msg`}>
         <div
            className="msg-img"
            style={{ backgroundImage: `url(${msg.img})` }}
         ></div>
         <div className="msg-bubble">
            <div className="msg-info">
               <div className="msg-info-name">{msg.fromName}</div>
               <div className="msg-info-time">
                  {formatMessageDate(new Date())}
               </div>
            </div>
            <div className="msg-text">{msg.streamID}</div>
         </div>
      </div>
   )
}

export default Message
