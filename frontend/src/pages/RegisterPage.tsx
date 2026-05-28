import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

const schema = z.object({
  fullName: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });
      toast.success('Account created! Welcome to TaskFlow 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.userMessage) {
        toast.error(err.userMessage);
      } else if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-600 rounded-xl mb-4 shadow-lg shadow-brand-900/50">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-surface-100">Create account</h1>
          <p className="text-surface-400 text-sm mt-1">Start managing tasks with AI assistance</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name <span className="text-surface-600">(optional)</span></label>
              <input {...register('fullName')} className="input" placeholder="John Doe" />
            </div>

            <div>
              <label className="label">Username</label>
              <input {...register('username')} className="input" placeholder="johndoe" autoComplete="username" />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="john@example.com" autoComplete="email" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="input"
                placeholder="Repeat password"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 mt-2">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-surface-400 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
