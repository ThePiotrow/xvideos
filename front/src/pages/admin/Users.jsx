import { useState, useEffect, useMemo } from "react";
import API from "../../api";
import { useAuth } from "../../contexts/authContext";
import LeftArrow from "../../components/icons/LeftArrow";
import RightArrow from "../../components/icons/RightArrows";
import { useLocation, Link } from "react-router-dom";
import AdminTabs from "./AdminTabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faRotateRight } from "@fortawesome/free-solid-svg-icons";

//import { toast } from "react-toastify";
//import "react-toastify/dist/ReactToastify.css";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function Users() {
  const [users, setUsers] = useState([]);
  const { user, token } = useAuth();
  const query = useQuery();
  const page = Number(query.get("page")) || 1;
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [limit, setLimit] = useState(10);

  const getUSers = async () => {
    API.get(`/admin/users?limit=${limit}&page=${page}`)
      .then((response) => {
        console.log(total);
        setUsers(response.data.users.sort((a, b) => a.username - b.username));
        setTotal(response.data.total);
        setPages(Math.ceil(response.data.total / limit));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const toggleBlock = async (_user) => {
    try {
      const response = await API.put(`/admin/users/${_user.id}`, {
        is_confirmed: !_user.is_confirmed,
      });
      setUsers([...users.filter((u) => u.id !== _user.id), response.data.user].sort((a, b) => a.username - b.username));
    } catch (error) {
      console.log(
        "Il y a un problème avec la récupération des utilisateurs" + error
      );
    }
  };

  useEffect(() => {
    getUSers();
  }, [query, limit]);

  return (
    <>
      <AdminTabs />
      <section className="container px-4 mx-auto">
        <div className="relative flex items-center gap-x-3 justify-between mt-5">
          <span className="px-4 py-2 text-sm text-blue-600 bg-blue-100 rounded-full">
            {users.length} / {total} utilisateurs
          </span>
          <select
            value={limit}
            onChange={(e) => setLimit(e.target.value)}

            className="px-4 py-2 text-sm text-blue-600 bg-blue-100 rounded-full">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>

        <div className="flex flex-col mt-6">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden border border-slate-700 md:rounded-lg">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-800">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 px-4 text-sm font-normal text-left text-slate-400"
                      >
                        <div className="flex items-center gap-x-3">
                          <span>Name</span>
                        </div>
                      </th>

                      <th
                        scope="col"
                        className="px-12 py-3.5 text-sm font-normal text-left text-slate-500"
                      >
                        <div className="flex items-center gap-x-2">
                          <span>Status</span>

                          <svg
                            className="h-3"
                            viewBox="0 0 10 11"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2.13347 0.0999756H2.98516L5.01902 4.79058H3.86226L3.45549 3.79907H1.63772L1.24366 4.79058H0.0996094L2.13347 0.0999756ZM2.54025 1.46012L1.96822 2.92196H3.11227L2.54025 1.46012Z"
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="0.1"
                            />
                            <path
                              d="M0.722656 9.60832L3.09974 6.78633H0.811638V5.87109H4.35819V6.78633L2.01925 9.60832H4.43446V10.5617H0.722656V9.60832Z"
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="0.1"
                            />
                            <path
                              d="M8.45558 7.25664V7.40664H8.60558H9.66065C9.72481 7.40664 9.74667 7.42274 9.75141 7.42691C9.75148 7.42808 9.75146 7.42993 9.75116 7.43262C9.75001 7.44265 9.74458 7.46304 9.72525 7.49314C9.72522 7.4932 9.72518 7.49326 9.72514 7.49332L7.86959 10.3529L7.86924 10.3534C7.83227 10.4109 7.79863 10.418 7.78568 10.418C7.77272 10.418 7.73908 10.4109 7.70211 10.3534L7.70177 10.3529L5.84621 7.49332C5.84617 7.49325 5.84612 7.49318 5.84608 7.49311C5.82677 7.46302 5.82135 7.44264 5.8202 7.43262C5.81989 7.42993 5.81987 7.42808 5.81994 7.42691C5.82469 7.42274 5.84655 7.40664 5.91071 7.40664H6.96578H7.11578V7.25664V0.633865C7.11578 0.42434 7.29014 0.249976 7.49967 0.249976H8.07169C8.28121 0.249976 8.45558 0.42434 8.45558 0.633865V7.25664Z"
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="0.3"
                            />
                          </svg>
                        </div>
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3.5 text-sm font-normal text-left text-slate-500"
                      >
                        <div className="flex items-center gap-x-2">
                          <span>Role</span>

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                            />
                          </svg>
                        </div>
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3.5 text-sm font-normal text-left text-slate-500"
                      >
                        Email address
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3.5 text-sm font-normal text-left text-slate-500"
                      >
                        Teams
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3.5 text-sm font-normal text-left text-slate-500"
                      >
                        Edit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 bg-slate-900">
                    {users.map((_user) => {
                      return (
                        <tr key={_user.id}>
                          <td className="px-4 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                            <div className="inline-flex items-center gap-x-3">
                              <div className="flex items-center gap-x-2">
                                <img
                                  className="object-cover w-10 h-10 rounded-full"
                                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                                  alt=""
                                ></img>
                                <div>
                                  <h2 className="font-normal text-white">
                                    @{_user.username}
                                  </h2>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-12 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full gap-x-2 ${_user.is_confirmed
                                ? "bg-emerald-600/60"
                                : "bg-red-400/40"
                                }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${_user.is_confirmed
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                                  }`}
                              ></span>
                              <h2
                                className={`text-sm font-normal ${_user.is_confirmed
                                  ? "text-emerald-500"
                                  : "text-red-500"
                                  }`}
                              >
                                {_user.is_confirmed ? "Actif" : "Inactif"}
                              </h2>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-500">
                            {_user.role}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-500">
                            {_user.email}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-500">
                            {_user.is_confirmed ? "Oui" : "Non"}
                          </td>
                          <td className="px-4 py-4 text-sm whitespace-nowrap">
                            <div className="flex items-center gap-x-6">
                              {_user.id !== user.id && (
                                <button
                                  onClick={() => toggleBlock(_user)}
                                  className={`transition-colors duration-200 focus:outline-none ${_user.is_confirmed
                                    ? "text-red-500"
                                    : "text-emerald-500"
                                    }`}
                                >
                                  {_user.is_confirmed ? <FontAwesomeIcon icon={faBan} /> : <FontAwesomeIcon icon={faRotateRight} />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-6">
          <Link
            to={`?page=${Math.max(1, page - 1)}`}
            className="flex items-center px-5 py-2 text-sm capitalize transition-colors duration-200 border rounded-md gap-x-2 bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800"
          >
            <LeftArrow />
            <span>précédent</span>
          </Link>

          <div className="items-center hidden md:flex gap-x-3">
            <span
              className="px-2 py-1 text-sm text-blue-500 rounded-md bg-slate-800"
            >
              Page {page} / {pages}
            </span>
          </div>

          <Link
            to={`?page=${Math.min(pages, page + 1)}`}
            className="flex items-center px-5 py-2 text-sm capitalize transition-colors duration-200 border rounded-md gap-x-2 bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800"
          >
            <span>Suivant</span>
            <RightArrow />
          </Link>
        </div>
      </section>
    </>
  );
}

export default Users;
