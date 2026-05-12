import React from "react";
import ReactDOM from "react-dom/client";
import "./catalogue.css";
import Catalogue from "./Catalogue.tsx";
import DemoApp from "./DemoApp.tsx";
import { useRouter } from "./router.ts";

function App(): React.ReactElement {
  const { path } = useRouter();
  if (path.startsWith("/demo")) return <DemoApp />;
  return <Catalogue />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
