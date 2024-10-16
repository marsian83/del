import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Layout from "../layout";

import HomePage from "./HomePage";
import ErrorPage from "./ErrorPage";
import PoliciesPage from "./PoliciesPage";
import NewPolicyPage from "./NewPolicyPage";
import PolicyPage from "./PolicyPage";
import AccountPage from "./AccountPage";
import SettingsPage from "./SettingsPage";
import NewMarketerPage from "./NewMarketerPage";
import BuyPolicyPage from "./BuyPolicyPage";
import DashboardPage from "./DashboardPage";
import ProtectedRoute, { ProtectedTypes } from "../common/ProtectedRoute";
import FaucetPage from "./FaucetPage";
import AccessibilityPage from "./AccessibilityPage";
import SwapPage from "./SwapPage";
import DevelopersPage from "./DevelopersPage";
import SureCoinPage from "./SureCoinPage";
import TestPage from "./TestPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route>
        <Route index element={<TestPage />} />
        <Route path="policies" element={<PoliciesPage />} />
        <Route path="policies/:address" element={<PolicyPage />} />

        <Route path="account" element={<AccountPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="accessibility" element={<AccessibilityPage />} />
        <Route path="buy-policy/:address" element={<BuyPolicyPage />} />
        <Route path="/swap" element={<SwapPage />} />
        <Route path="surecoin" element={<SureCoinPage />} />

        <Route element={<ProtectedRoute type={ProtectedTypes.CONSUMERONLY} />}>
          <Route path="new-marketer" element={<NewMarketerPage />} />
        </Route>

        <Route element={<ProtectedRoute type={ProtectedTypes.MARKETERONLY} />}>
          <Route path="new-policy" element={<NewPolicyPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="developers" element={<DevelopersPage />} />
        </Route>

        <Route path="*" element={<ErrorPage />} />
        <Route path="/faucet" element={<FaucetPage />} />
      </Route>
    </>,
  ),
);

export default router;
