import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { AxiosError } from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate("/dashboard");
    },
  });

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const errorMessage =
    (mutation.error as AxiosError<{ message: string }>)?.response?.data?.message;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      mutation.mutate({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-96"
      >
        <h2 className="text-xl font-semibold mb-4">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className={`w-full border p-2 mb-3 ${errors.email ? 'border-red-500' : ''}`}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors(prev => ({...prev, email: undefined}));
          }}
          required
        />
        {errors.email && <p className="text-red-500 text-sm mb-3">{errors.email}</p>}

        <input
          type="password"
          placeholder="Password"
          className={`w-full border p-2 mb-3 ${errors.password ? 'border-red-500' : ''}`}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors(prev => ({...prev, password: undefined}));
          }}
          required
        />
        {errors.password && <p className="text-red-500 text-sm mb-3">{errors.password}</p>}

        {mutation.isError && (
          <p className="text-red-500 text-sm mb-2">
            {errorMessage || "Login failed"}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-black text-white py-2 rounded"
        >
          {mutation.isPending ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
