import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { validateInviteApi, registerViaInviteApi } from "../api/auth.api";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";

export default function InviteRegister() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; password?: string }>({});

  // 1️⃣ Validate invite token
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => validateInviteApi(token!),
    enabled: !!token,
    refetchOnWindowFocus: false, 
  });

  // 2️⃣ Register mutation
  const mutation = useMutation({
    mutationFn: registerViaInviteApi,
    onSuccess: (data) => {
      login(data.token);
      navigate("/dashboard");
    },
  });

  const validateForm = () => {
    const newErrors: { name?: string; password?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      mutation.mutate({
        token: token!,
        name,
        password,
      });
    }
  };

  if (isLoading) {
    return <p className="text-center mt-10">Validating invite...</p>;
  }

  if (isError) {
    return (
      <p className="text-center mt-10 text-red-500">
        Invalid or expired invite
      </p>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-96"
      >
        <h2 className="text-xl font-semibold mb-4">Complete Registration</h2>

        <p className="text-sm mb-2">
          <strong>Email:</strong> {data.email}
        </p>
        <p className="text-sm mb-4">
          <strong>Role:</strong> {data.role}
        </p>

        <input
          type="text"
          placeholder="Full Name"
          className={`w-full border p-2 mb-3 ${errors.name ? 'border-red-500' : ''}`}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors(prev => ({...prev, name: undefined}));
          }}
          required
        />
        {errors.name && <p className="text-red-500 text-sm mb-3">{errors.name}</p>}

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
            Registration failed
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-black text-white py-2 rounded"
        >
          {mutation.isPending ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
