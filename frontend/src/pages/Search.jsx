  import axiosInstance from "../api/axiosInstance.js";
  import React, { useState } from "react";
  import { Link } from "react-router-dom";
  import { LoadingAnimation } from "../components/Loading";

  const Search = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    async function fetchUsers() {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("/user/all?search=" + search); //This is the backend route that returns all users.

        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0b1220] pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 text-3xl font-bold mb-6">
            Discover People
          </h1>
          
          <div className="rounded-2xl p-0.5 bg-gradient-to-r from-emerald-500/60 via-teal-400/60 to-cyan-400/60 mb-6">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                  type="text"
                  className="flex-1 w-full bg-white/10 backdrop-blur border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  onClick={fetchUsers}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-emerald-500/50 transition-all font-semibold whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingAnimation />
            </div>
          ) : (
            <>
              {users && users.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((e) => (
                    <Link
                      key={e._id}
                      className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur border border-white/10 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all p-4 flex items-center gap-4 hover:bg-white/10"
                      to={`/user/${e._id}`}
                    >
                      <img
                        src={e.profilePic?.url || "/default-avatar.png"}
                        alt={e.name}
                        className="w-14 h-14 rounded-full border-2 border-white/20 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{e.name}</p>
                        <p className="text-white/60 text-sm truncate">{e.email}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-white/60 text-lg">No users found. Try a different search!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  export default Search;