import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Spinner } from "react-bootstrap";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/logout" />;
  }

  return children;
}
