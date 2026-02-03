// import React from "react";

// export default function ConfirmModal({ message, onCancel, onConfirm }) {
//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100vw",
//         height: "100vh",
//         background: "rgba(124,58,237,0.10)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         zIndex: 1000,
//       }}
//     >
//       <div
//         style={{
//           background: "var(--purple-light)",
//           padding: 20,
//           borderRadius: 12,
//           minWidth: 300,
//           border: "2px solid var(--purple-accent)",
//           boxShadow: "0 4px 16px 0 rgba(124,58,237,0.10)",
//         }}
//       >
//         <p
//           style={{
//             marginBottom: 24,
//             width: 270,
//             color: "var(--purple-main)",
//             fontWeight: 600,
//           }}
//         >
//           {message}
//         </p>
//         <div
//           style={{
//             width: 270,
//             display: "flex",
//             justifyContent: "flex-end",
//             gap: 12,
//           }}
//         >
//           <button
//             onClick={onCancel}
//             style={{
//               padding: "8px 16px",
//               borderRadius: 6,
//               background: "var(--purple-accent)",
//               color: "var(--purple-main)",
//               border: "none",
//               fontWeight: 600,
//               transition: "background 0.2s",
//             }}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             style={{
//               padding: "8px 16px",
//               borderRadius: 6,
//               background: "var(--purple-main)",
//               color: "var(--text-light)",
//               border: "none",
//               fontWeight: 600,
//               transition: "background 0.2s",
//             }}
//           >
//             Confirm
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
