/* ════════════════════════════════════════
   陽光花園 jackpipi — firebase-config.js
   統一管理 Firebase 初始化與模組匯出
════════════════════════════════════════ */

// 1. 引入 Firebase 核心與需要的服務
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// 2. 你的 Firebase 專案設定
const firebaseConfig = {
  apiKey: "AIzaSyC103Q-v31-z7nHnnM8KpIZbrrzjrGgGJ4",
  authDomain: "fir-config-f2e57.firebaseapp.com",
  projectId: "fir-config-f2e57",
  storageBucket: "fir-config-f2e57.firebasestorage.app",
  messagingSenderId: "860181486529",
  appId: "1:860181486529:web:6f7053a9141694afc66d40",
  measurementId: "G-G8P116856S"
};

// 3. 初始化 Firebase 應用程式
const app = initializeApp(firebaseConfig);

// 4. 匯出 (export) 各項服務實體，讓其他 HTML 頁面可以共用
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
