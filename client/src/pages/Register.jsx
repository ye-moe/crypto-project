import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setErrorMessage("");
      await register(formData);
      navigate("/");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to register. Try again."
      );
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-lg">
      <h2 className="text-3xl font-bold">Create account</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Save your portfolio and watchlist to the database.
      </p>

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</span>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-300 dark:bg-slate-50 px-4 py-2.5 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-300 dark:bg-slate-50 px-4 py-2.5 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-300 dark:bg-slate-50 px-4 py-2.5 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-500"
        >
          Create account
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-blue-400">
          Log in
        </Link>
      </p>
    </section>
  );
}

export default Register;