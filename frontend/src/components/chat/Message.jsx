import React from "react";

const Message = ({ ownMessage, message }) => {
  if (!message) return null;

  return (
    <div className={`flex w-full my-0.5 ${ownMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] px-3.5 py-2.5 rounded-2xl shadow-2xs transition-all ${
          ownMessage
            ? "bg-indigo-600 text-white rounded-br-xs font-normal"
            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-xs font-normal"
        }`}
      >
        <p className="break-words text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Message;