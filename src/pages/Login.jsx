import { toast } from "react-toastify";

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import Button from "../components/ButtonComponent";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// export default function Login() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate()
//   // const loading = useSelector((state) => state.auth.loading);
// // localStorage.removeItem('persist:root');

// const persistedState = localStorage.getItem('persist:root');
// console.log(JSON.parse(persistedState),"deepak");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   // const handleLogin = () => {
//   //   // navigate("/tasks")
//   //   if (!email || !password) return;
//   //   dispatch({ type: "LOGIN_REQUEST", payload: { email, password } });
//   // };

// //   const handleLogin = async () => {
// //     debugger
// //   if (!email || !password) return;

// //   try {
// //    const response = await axios.post(
// //   "https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Schedules.asmx/DailySchedule_Get",
// //   { StoreID: Number(email) }, // Pass object directly
// //   {
// //     headers: {
// //       "Content-Type": "application/json",
// //     },
// //   }
// // );

// // // Access data
// // console.log(response.data); // sometimes the data is inside response.data.d

// //     console.log("API Response:", response.data);

// //     navigate(`/tasks/${email}`);

// //   } catch (error) {
// //     debugger
// //     console.error("Login error:", error);

// //     alert("Invalid credentials or API error");
// //   }
// // };

// const handleLogin = async () => {
//   if (!email || !password) return;

//   setLoading(true);

//   try {
//     const response = await axios.post(
//       "https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Schedules.asmx/DailySchedule_Get",
//       { StoreID: Number(email) },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("API Response:", response.data);
// localStorage.setItem("maindata", JSON.stringify(response.data.data));

// localStorage.setItem("auth", true)
// localStorage.setItem("id", Number(email))
//     navigate(`/tasks/${email}`);
//   } catch (error) {
//     console.error("Login error:", error);
//     alert("Invalid credentials or API error");
//   } finally {
//     setLoading(false); // ✅ stop loading
//   }
// };
// const isAuth = localStorage.getItem("auth")
// const id = localStorage.getItem("id")
// useEffect(()=>{
//   if(isAuth !== "false" && Number(id) !== 0){
//  navigate(`/tasks/${id}`);

//   }
// },[isAuth,id])

//   return (
//     <div style={styles.container}>
//       <div style={styles.loginCard}>
//         <h2 style={styles.title}>Welcome Back</h2>
//         <p style={styles.subtitle}>Please sign in to continue</p>

//         <div style={styles.formGroup}>
//           <label style={styles.label}>Email Address</label>
//           <input
//             style={styles.input}
//             type="email"
//             placeholder="alex@store.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//         </div>

//         <div style={styles.formGroup}>
//           <label style={styles.label}>Password</label>
//           <input
//             style={styles.input}
//             type="password"
//             placeholder="••••••••"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//         </div>

//                 {/* <Button
//           variant="primary"
//           size="xlarge"
//           fullWidth
//           onClick={handleLogin}
//           isLoading={loading}
//           isDisabled={!email || !password}
//         >
//           {loading ? "Logging in..." : "Login"}
//         </Button> */}

//       <Button
//   variant="primary"
//   size="xlarge"
//   fullWidth
//   onClick={handleLogin}
//   isLoading={loading}
//   isDisabled={!email || !password || loading}
// >
//   Login
// </Button>

//       </div>
//     </div>
//   );
// }

// const styles = {
//    container: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: '80vh',   // ✅ REQUIRED
//     backgroundColor: '#f3f4f6',
//     padding: '20px',
//   },
//   loginCard: {
//     width: '100%',
//     maxWidth: '400px',
//     backgroundColor: 'white',
//     padding: '28px',
//     borderRadius: '18px',
//     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
//   },
//   title: {
//     fontSize: '24px',
//     fontWeight: '600',
//     color: '#111827',
//     marginBottom: '8px',
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: '14px',
//     color: '#6b7280',
//     marginBottom: '28px',
//     textAlign: 'center',
//   },
//   formGroup: {
//     marginBottom: '20px',
//   },
//   label: {
//     display: 'block',
//     fontSize: '13px',
//     color: '#374151',
//     fontWeight: '500',
//     marginBottom: '6px',
//   },
//   input: {
//     width: '100%',
//     padding: '12px',
//     borderRadius: '10px',
//     border: '1px solid #e5e7eb',
//     fontSize: '14px',
//     boxSizing: 'border-box',
//     backgroundColor: '#f9fafb',
//   },
//   loginButton: {
//     width: '100%',
//     backgroundColor: '#10b981',
//     color: 'white',
//     padding: '14px',
//     borderRadius: '12px',
//     border: 'none',
//     fontSize: '16px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     marginTop: '8px',
//   },
//   version: {
//     textAlign: 'center',
//     marginTop: '30px',
//     fontSize: '12px',
//     color: '#9ca3af',
//   },
// };

// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";

// export default function Login() {
//   const dispatch = useDispatch();
//   const loading = useSelector((state) => state.auth.loading);

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = () => {
//     if (!email || !password) return;

//     dispatch({
//       type: "LOGIN_REQUEST",
//       payload: { email, password },
//     });
//   };

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         {/* App Icon */}
//         <div className="app-icon">
//           🛍️
//         </div>

//         <h2>Welcome Back</h2>
//         <p className="subtitle">Please sign in to continue</p>

//         <div className="field">
//           <label>Email Address</label>
//           <input
//             type="email"
//             placeholder="alex@store.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//         </div>

//         <div className="field">
//           <label>Password</label>
//           <input
//             type="password"
//             placeholder="••••••••"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//         </div>

//         <button
//           className="primary-btn"
//           onClick={handleLogin}
//           disabled={loading}
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>

//       </div>
//     </div>
//   );navigate
// }

import React, { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Button from "../components/ButtonComponent";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchTasks } from "../redux/actions/tasksActions";
import axios from "axios";




export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  console.log(showPassword, "showPassword");


  // const checkAndPerformCleanup = () => {
  //   const lastCleanup = localStorage.getItem("last_data_cleanup_timestamp");
  //   const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
  //   const now = new Date();

  //   if (!lastCleanup || now - new Date(lastCleanup) > twentyFourHoursInMs) {
  //     console.log("Performing 24-hour data cleanup on login...");

  //     // Clear user session data
  //     localStorage.removeItem("auth");
  //     localStorage.removeItem("id");
  //     localStorage.removeItem("maindata");

  //     // Update cleanup timestamp
  //     localStorage.setItem("last_data_cleanup_timestamp", now.toISOString());
  //   }
  // };

  const checkAndPerformCleanup = () => {
    const lastCleanup = localStorage.getItem("last_data_cleanup_timestamp");
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
    const now = new Date();

    if (!lastCleanup || now - new Date(lastCleanup) > twentyFourHoursInMs) {
      console.log("Performing 24-hour data cleanup on login...");

      // Clear user session data but NOT offline data
      localStorage.removeItem("auth");
      localStorage.removeItem("id");

      // DO NOT clear: localStorage.removeItem("maindata");
      // DO NOT clear: Redux Persist data (managed by persistConfig)

      // Update cleanup timestamp
      localStorage.setItem("last_data_cleanup_timestamp", now.toISOString());
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);

    try {
      const response = await axios.post(
        "https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Schedules.asmx/User_Login",
        { Username: email, Password: password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );



      console.log("API Response:", response.data);

      // Check and perform cleanup if needed
      checkAndPerformCleanup();

      // Parse new API response
      const loginData = response.data.data && response.data.data[0];
      if (!loginData || loginData.LoginStatus !== "VALID") {
        alert("Invalid credentials or API error");
        setLoading(false);
        return;
      }

      // Store session data
      localStorage.setItem("auth", "true");
      localStorage.setItem("UserID", loginData.UserID);
      localStorage.setItem("Type", loginData.Type);
      localStorage.setItem("StoreID", loginData.StoreID);
      localStorage.setItem("maindata", JSON.stringify(loginData));
      localStorage.setItem("StoreName", loginData.Store);
      // Show login success toast
      toast.success("Login successful!");

      // Fetch tasks after login
      // Navigation logic
      if (loginData.Type === "Admin") {
        navigate("/admin/vendors");
      } else {
      await dispatch(fetchTasks(loginData.StoreID));
        

        navigate(`/read/${loginData.StoreID}`);
      }
    } catch (error) {


      
      console.error("Login error:", error);
      alert("Invalid credentials or API error");
    } finally {
      setLoading(false);
    }
  };

  const dummyApiResponse = {
    data: {
      status: true,
      loginType: 1, // 1 = Admin, 2 = Merchandiser
      data: {
        storeId: 12345,
        storeName: "Tamimi Central Store",
        city: "Riyadh",
        scheduleDate: "2026-01-15",
        tasks: [
          {
            taskId: 101,
            taskName: "Check Inventory",
            completed: false,
          },
          {
            taskId: 102,
            taskName: "Update Price Tags",
            completed: true,
          },
        ],
      },
    },
  };

  const isAuth = localStorage.getItem("auth");
  const id = localStorage.getItem("StoreID");
  const type = localStorage.getItem("Type");

  useEffect(() => {
    if (isAuth === "true" && Number(id) !== 0) {
      // Check cleanup on app start as well
      checkAndPerformCleanup();
      if (type === "Admin") {
        navigate(`/admin/vendors`);
      } else {
        navigate(`/read/${id}`);
      }
    }
  }, [isAuth, id, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Please sign in to continue</p>

        <div style={styles.formGroup}>
          <label style={styles.label}>Store Name</label>
          <input
            style={styles.input}
            type="email"
            placeholder="Store Name"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              style={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: "12px",
                top: "45%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "22px",
                color: "#6b7280",
                userSelect: "none",
                display: "flex",
                alignItems: "center",
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
        </div>

        {/* <Button
          variant="primary"
          size="xlarge"
          fullWidth
          onClick={handleLogin}
          isLoading={loading}
          isDisabled={!email || !password}
        >
          {loading ? "Logging in..." : "Login"}
        </Button> */}

        <Button
          variant="primary"
          size="xlarge"
          fullWidth
          onClick={handleLogin}
          isLoading={loading}
          isDisabled={!email || !password || loading}
        >
          Login
        </Button>

        <div style={styles.version}>
  App Version 1.0.0
</div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "80vh", // ✅ REQUIRED
    backgroundColor: "#f3f4f6",
    padding: "20px",
  },
  loginCard: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "white",
    padding: "28px",
    borderRadius: "18px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "28px",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#374151",
    fontWeight: "500",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "#f9fafb",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#10b981",
    color: "white",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  version: {
    textAlign: "center",
    marginTop: "30px",
    fontSize: "12px",
    color: "#9ca3af",
  },
};
