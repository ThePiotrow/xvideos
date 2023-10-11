import React from "react";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-dark-100">
      <h1 className="text-4xl font-bold text-slate-500">404</h1>
      <p className="text-lg text-slate-500">
        Oops! The page you are looking for does not exist.
      </p>
      <a
        href="/"
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Go back to home
      </a>
    </div>
  );
};

export default NotFoundPage;
