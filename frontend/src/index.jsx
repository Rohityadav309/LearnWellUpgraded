import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";

import App from "./App.jsx";
import "./index.css";
import rootReducer from "./reducer/index.js";

const learnWellStore = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={learnWellStore}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
