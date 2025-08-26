"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
	username: z.string().min(3),
	email: z.string().email(),
	password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const {
		handleSubmit,
		register,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>( { resolver: zodResolver(schema) });

	// Prevent hydration mismatch by only running client-side code after mount
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Redirect if already authenticated (only after mount)
	useEffect(() => {
		if (isMounted && !isLoading && isAuthenticated) {
			router.push('/tasks');
		}
	}, [isAuthenticated, isLoading, isMounted, router]);

	const onSubmit = async (values: FormValues) => {
		setError(null);
		setSuccess(null);
		try {
			await api.post("/auth/register", values);
			setSuccess("Account created successfully! Redirecting to login...");
			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch (e: any) {
			setError(e?.response?.data?.message || "Registration failed");
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	// Show loading while checking authentication or before mount
	if (!isMounted || isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Don't render form if already authenticated
	if (isAuthenticated) {
		return null;
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-100">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-xl shadow-lg border p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
						<p className="text-gray-600 mt-2">Join us and start managing your tasks</p>
					</div>
					
					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-sm text-red-600" role="alert">
								{error}
							</p>
						</div>
					)}
					
					{success && (
						<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
							<p className="text-sm text-green-600" role="alert">
								{success}
							</p>
						</div>
					)}
					
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
							<input
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
								placeholder="Choose a username"
								{...register("username")}
							/>
							{errors.username && (
								<p className="text-xs text-red-600 mt-1">{errors.username.message}</p>
							)}
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
							<input
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
								placeholder="you@example.com"
								type="email"
								{...register("email")}
							/>
							{errors.email && (
								<p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
							)}
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
									placeholder="••••••••"
									{...register("password")}
								/>
								<button
									type="button"
									onClick={togglePasswordVisibility}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
								>
									{showPassword ? (
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
										</svg>
									) : (
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									)}
								</button>
							</div>
							{errors.password && (
								<p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
							)}
							<p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
						</div>
						
						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-green-600 text-white rounded-lg py-3 px-4 font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? (
								<div className="flex items-center justify-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									Creating account...
								</div>
							) : (
								"Create Account"
							)}
						</button>
					</form>
					
					<div className="mt-8 text-center">
						<p className="text-sm text-gray-600">
							Already have an account?{" "}
							<a href="/login" className="font-medium text-green-600 hover:text-green-700 underline">
								Sign in here
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
