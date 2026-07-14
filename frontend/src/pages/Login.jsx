import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Building2, Users, Receipt, MessageSquareWarning, Megaphone, UserCheck,
  Globe, ChevronDown, User, Lock, Eye, EyeOff, LogIn, ShieldCheck, Clock
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const FeatureIcon = ({ icon: Icon, label }) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <div className="w-14 h-14 rounded-2xl border border-white/20 bg-white/5 flex items-center justify-center backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <span className="text-[11px] font-medium text-white/80 whitespace-pre-line leading-tight">{label}</span>
  </div>
);

const TrustBadge = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start gap-2 flex-1">
    <div className="p-1.5 bg-slate-100 text-[#0a192f] rounded-lg shrink-0">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h4 className="text-[11px] font-bold text-slate-900 leading-tight">{title}</h4>
      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{desc}</p>
    </div>
  </div>
);

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'committee_member') {
        navigate('/committee', { replace: true });
      } else {
        navigate('/resident', { replace: true });
      }
    }
  }, [user, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    const result = await login(data.email, data.password);
    
    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else if (result.user.role === 'committee_member') {
        navigate('/committee');
      } else {
        navigate('/resident');
      }
    } else {
      setError(result.error || "Failed to log in");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-8 font-sans bg-[#f3f4f6]">
      <div className="flex w-full max-w-[1200px] min-h-[700px] bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Section - Hidden on small screens */}
        <div className="hidden lg:flex w-[45%] flex-col relative bg-[#061224] text-white overflow-hidden z-10">
        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col pt-16 px-12 z-20">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 mb-6 justify-center">
            <Building2 className="w-12 h-12 text-[#3b82f6]" strokeWidth={1.5} />
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-1">Society</h1>
              <h2 className="text-2xl font-medium text-[#3b82f6]">Management System</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-14 px-8">
            <div className="h-px bg-white/20 flex-1"></div>
            <p className="text-xs tracking-wider font-medium text-white/70 whitespace-nowrap uppercase">Smart Management. Stronger Communities.</p>
            <div className="h-px bg-white/20 flex-1"></div>
          </div>
          
          {/* Feature Icons Row */}
          <div className="flex justify-between items-start w-full px-4 mb-auto">
            <FeatureIcon icon={Users} label={"Residents\nManagement"} />
            <FeatureIcon icon={Receipt} label={"Maintenance\nBilling"} />
            <FeatureIcon icon={MessageSquareWarning} label={"Complaints\nTracking"} />
            <FeatureIcon icon={Megaphone} label={"Notices &\nAnnouncements"} />
            <FeatureIcon icon={UserCheck} label={"Visitor\nManagement"} />
          </div>
        </div>

        {/* Background Image at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[65%] z-0">
          {/* Gradient Overlay to blend the image perfectly */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#061224] via-[#061224]/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-[#061224]/30 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover object-bottom" 
            alt="Modern Luxury Apartments" 
          />
        </div>
      </div>

      {/* Right Section - Form Area */}
      <div className="flex-1 flex flex-col bg-white relative">
      
        {/* Main Form Container */}
        <div className="flex-1 flex flex-col justify-center max-w-[420px] w-full mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0a192f] mb-3">Welcome Back!</h2>
            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              <MessageSquareWarning className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" strokeWidth={1.5} />
                <Input 
                  id="email"
                  type="email"
                  className="pl-11 h-12 rounded-lg border-slate-200 bg-white focus-visible:ring-[#0a192f] text-slate-900" 
                  placeholder="Email or Mobile Number" 
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1 pl-1">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" strokeWidth={1.5} />
                <Input 
                  id="password"
                  className="pl-11 pr-11 h-12 rounded-lg border-slate-200 bg-white focus-visible:ring-[#0a192f] text-slate-900" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Password" 
                  {...register("password")}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.5} /> : <Eye className="h-5 w-5" strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1 pl-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between pt-1">
              
              <a href="#" className="text-sm text-[#0a192f] font-semibold hover:underline">Forgot Password?</a>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-[#061224] hover:bg-[#112240] text-white text-base rounded-lg gap-2 mt-2 shadow-md transition-all"
            >
              <LogIn className="w-5 h-5" strokeWidth={1.5} />
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          

          

          
        </div>

        {/* Footer */}
        <div className="w-full border-t border-slate-100 p-6 bg-white mt-auto">
          <div className="max-w-[450px] mx-auto flex justify-between gap-4">
            <TrustBadge icon={ShieldCheck} title="Secure & Reliable" desc="Your data is safe with us" />
            <div className="w-px bg-slate-100" />
            <TrustBadge icon={Clock} title="Easy & Convenient" desc="Manage everything in one place" />
            <div className="w-px bg-slate-100" />
            <TrustBadge icon={Users} title="For Everyone" desc="Residents, Admins & Staff" />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
