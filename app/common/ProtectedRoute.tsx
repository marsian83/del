import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useWeb3 from "../contexts/web3context";

export enum ProtectedTypes {
  PUBLICONLY,
  VERIFIEDONLY,
  CONSUMERONLY,
  MARKETERONLY,
}

interface ProtectedRouteProps {
  type: ProtectedTypes;
  fallbackUrl?: string;
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  const { user } = useWeb3();
  const [loading, setLoading] = useState(true);

  // console.log({
  //   page: 'ProtectedRoute',
  //   user
  // });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-t-4 border-blue-500"></div>
        <p className="text-lg">Verifying...</p>
      </div>
    );
  }

  if (props.type === ProtectedTypes.PUBLICONLY) {
    return <>{!user ? <Outlet /> : <Navigate to="/" />}</>;
  }

  // if (props.type === ProtectedTypes.VERIFIEDONLY) {
  //   !user && alert("Please Connect your wallet");
  //   return <>{user ? <Outlet /> : <Navigate to="/" />}</>;
  // }

  if (props.type === ProtectedTypes.CONSUMERONLY) {
    return (
      <>
        {!user ? <Outlet /> : user.marketer ? <Navigate to="/" /> : <Outlet />}
      </>
    );
  }

  if (props.type === ProtectedTypes.MARKETERONLY) {
    return <>{user && user.marketer ? <Outlet /> : <Navigate to="/" />}</>;
  }

  return <Navigate to="/" />;
}
