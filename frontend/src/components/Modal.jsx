import React from "react";
import { Link } from "react-router-dom";

const Modal = ({ value = [], title, setShow }) => {
  return (
    <div className="fixed inset-0 bg-black/10 backdrop-brightness-90 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg p-4 shadow-lg w-[300px] max-h-[300px] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-semibold text-blue-600">{title}</h1>
          <button
            onClick={() => setShow(false)}
            className="text-gray-500 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {value.length > 0 ? (
          <div className="flex flex-col gap-2">
            {value.map((e, i) => (
              <Link
                to={`/user/${e._id}`}
                key={e._id}
                onClick={() => setShow(false)}
                className="bg-gray-500 text-white rounded-md py-2 px-3 flex items-center gap-4"
              >
                <span>{i + 1}</span>
                <img
                  className="w-8 h-8 rounded-full"
                  src={e.profilePic?.url || "/default-avatar.png"}
                  alt={e.name}
                />
                <span>{e.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No {title} yet</p>
        )}
      </div>
    </div>
  );
};

export default Modal;
