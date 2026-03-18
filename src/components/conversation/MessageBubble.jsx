import { Bot, User, Check } from 'lucide-react';
import Typewriter from '../chat/Typewriter';

const MessageBubble = ({ message, senderType, businessName, onTypeComplete }) => {
  const isOwner = senderType === 'owner';
  const isAI = senderType === 'ai';
  const isCustomer = senderType === 'customer';

  const getSenderLabel = () => {
    if (isOwner) return businessName || 'Business';
    if (isAI) return 'VOXY AI';
    return 'Customer';
  };

  return (
    <div className={`flex flex-col mb-4 group ${isOwner ? 'items-end' : 'items-start'}`}>
      <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isOwner ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 mb-1.5 px-1 ${isOwner ? 'flex-row-reverse text-blue-400' : isAI ? 'text-[#00D18F]' : 'text-zinc-500'}`}>
          <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
            {getSenderLabel()}
          </span>
          <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest opacity-40">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className={`relative px-4 py-3 rounded-2xl text-[14px] leading-relaxed transition-all duration-300 shadow-xl ${
          isOwner 
            ? 'bg-blue-600/10 text-blue-100 border border-blue-500/20 rounded-tr-none' 
            : isAI
              ? 'bg-[#00D18F]/10 text-[#00D18F] border border-[#00D18F]/20 rounded-tl-none'
              : 'bg-[#1A1A1A] text-zinc-200 border border-white/5 rounded-tl-none'
        }`}>
          {message.isNew && !isOwner ? (
            <Typewriter 
              text={message.content} 
              onComplete={() => onTypeComplete?.(message.id)} 
            />
          ) : (
            message.content
          )}
          
          {isOwner && (
            <div className="absolute -bottom-5 right-0 flex items-center gap-1 opacity-40">
                <Check className="size-2 text-blue-400" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-blue-400">Sent</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
