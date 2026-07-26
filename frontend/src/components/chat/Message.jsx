import React from "react";

const Message = ({ ownMessage, message }) => {
  return (
    <div className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
          ownMessage
            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-sm"
            : "bg-white/10 backdrop-blur text-white border border-white/20 rounded-bl-sm"
        }`}
      >
        <p className="break-words">{message}</p>
      </div>
    </div>
  );
};

export default Message;