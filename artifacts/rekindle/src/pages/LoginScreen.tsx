
// import { useState } from "react";
// import { useLocation } from "wouter";
// import { syncUserLogin } from "../services/userService";

// export default function LoginScreen() {
//   const [, setLocation] = useLocation();
//   const [phone, setPhone] = useState("");
//   const [name, setName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!phone) {
//       setError("Please enter your phone number");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       // Automatically pushes user record to Neon Postgres
//       await syncUserLogin(phone, name);

//       // Navigate to home screen on success
//       setLocation("/home");
//     } catch (err: any) {
//       setError(err.message || "Failed to sign in. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen px-6">
//       <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
//         <h2 className="text-2xl font-bold">Welcome to Rekindle</h2>
        
//         {error && <p className="text-sm text-red-500">{error}</p>}

//         <div>
//           <label className="block text-sm font-medium mb-1">Phone Number</label>
//           <input
//             type="tel"
//             placeholder="+91 98765 43210"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Your Name</label>
//           <input
//             type="text"
//             placeholder="Divyam"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full py-3 font-semibold text-white bg-primary rounded-lg shadow-md hover:opacity-90 disabled:opacity-50"
//         >
//           {loading ? "Connecting..." : "Continue"}
//         </button>
//       </form>
//     </div>
//   );
// }









import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { syncUserLogin } from "../services/userService";
import { useApp } from "@/context/AppContext";

export default function LoginScreen() {
  const [, setLocation] = useLocation();
  const { setUser } = useApp();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    
    setError("");
    
    // Generate kaarna hai a random 6-digit OTP for the prototype
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setStep(2);
    
    toast.success(`Prototype OTP: ${mockOtp}`, {
      duration: 8000,
      position: "top-center"
    });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      setError("Incorrect OTP. Please check the banner notification.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const cleanPhone = phone.startsWith("+91") ? phone : `+91 ${phone.trim()}`;
      
      // Pushes user to Neon Postgres & saves to local storage
      const loggedInUser = await syncUserLogin(cleanPhone, name);

      // Update global state instantly
      if (setUser) {
        setUser(loggedInUser as any);
      }

      setLocation("/home");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6" style={{ background: '#0A0A0A' }}>
      <div className="w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold text-white">
          {step === 1 ? "Welcome to Rekindle" : "Verify your number"}
        </h2>
        
        {error && <p className="text-sm text-red-500">{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Phone Number</label>
              <div className="flex items-center" style={{ background: '#1E1E1E', borderRadius: 12, height: 52, border: '1px solid #2C2C2C', overflow: 'hidden' }}>
                <div className="flex items-center justify-center px-3" style={{ borderRight: '1px solid #2C2C2C', height: '100%' }}>
                  <span className="font-bold text-white" style={{ fontSize: 16 }}>+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="flex-1 outline-none text-white px-3"
                  style={{ background: 'transparent', fontSize: 16 }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Your Name</label>
              <input
                type="text"
                placeholder="Divyam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none text-white"
                style={{ background: '#1E1E1E', height: 52, border: '1px solid #2C2C2C', borderRadius: 12, fontSize: 16 }}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 font-semibold text-white rounded-lg shadow-md hover:opacity-90"
              style={{ background: '#E8401C', height: 56, borderRadius: 14, fontSize: 16 }}
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-400">
              Enter the 6-digit code sent to +91 {phone}
            </p>
            
            <div>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none text-center tracking-widest text-white"
                style={{ background: '#1E1E1E', height: 52, border: '1px solid #2C2C2C', borderRadius: 12, fontSize: 24 }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold text-white rounded-lg shadow-md hover:opacity-90 disabled:opacity-50"
              style={{ background: '#E8401C', height: 56, borderRadius: 14, fontSize: 16 }}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
              }}
              className="w-full py-3 font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
