import React from 'react';
import { Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatMessage } from '../types';
import { ImagePlaceholder } from './ImagePlaceholder';
import { Button } from './Button';

interface ChatMessageItemProps {
    msg: ChatMessage;
}

const parseText = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-brand-600 dark:text-brand-400 font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

export const ChatMessageItem: React.FC<ChatMessageItemProps> = React.memo(({ msg }) => {
    const isUser = msg.role === 'user';

    return (
        <div className={`flex w-full flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}>
            <div className={`max-w-[85%] p-5 text-sm leading-relaxed ${isUser
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-l-2 border-brand-500'
                }`}>
                {parseText(msg.text)}
            </div>

            {!isUser && msg.recommendedService && (
                <div className="mt-4 w-full max-w-[320px] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl animate-scale-in relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 opacity-10">
                        <ImagePlaceholder type="abstract" seed={msg.recommendedService.id} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-3 h-3 text-brand-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Recomendación IA</span>
                        </div>
                        <h3 className="font-bold text-xl text-black dark:text-white leading-tight mb-2 uppercase tracking-tighter">{msg.recommendedService.name}</h3>
                        <p className="text-xs text-zinc-500 mb-6 line-clamp-2 uppercase tracking-widest">{msg.recommendedService.description}</p>
                        <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-black dark:text-white text-lg">${msg.recommendedService.price}</span>
                            <Link to={`/booking?serviceId=${msg.recommendedService.id}`}>
                                <Button variant="brand" size="sm">
                                    Reservar <ArrowRight className="w-3 h-3 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
