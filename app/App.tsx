import { RouterProvider } from "react-router-dom";
import { GlobalContextProvider } from "./contexts/globalContext";
import { Web3Provider } from "./contexts/web3context";
import router from "./pages/router";
import { ToastContainer } from "react-toastify";

export default function App() {
  return (
    <Web3Provider>
      <RouterProvider router={router} />
    </Web3Provider>
  );
}
