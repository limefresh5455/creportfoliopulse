import { useEffect, useRef } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getProfileDetail } from "../Networking/User/APIs/Profile/ProfileApi";
import { USER_ROUTE_FEATURE_MAP } from "./userRouteFeatureMap";

const LAST_ALLOWED_ROUTE = "last_allowed_route";
const IDLE_TIMEOUT = 3 * 60 * 1000;

const matchRoute = (pathname, routeMap) => {
  return Object.keys(routeMap).find((route) => {
    if (route.includes(":")) {
      const base = route.split("/:")[0];
      return pathname.startsWith(base);
    }
    return route === pathname;
  });
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = sessionStorage.getItem("access_token");
  const role = sessionStorage.getItem("role");

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toastShownRef = useRef(false);
  const idleTimerRef = useRef(null);

  const { userdata } = useSelector((state) => state.ProfileSlice);

  useEffect(() => {
    if (token && role === "user" && !userdata) {
      dispatch(getProfileDetail());
    }
  }, [dispatch, token, role, userdata]);

  useEffect(() => {
    if (!token) return;

    const logoutUser = () => {
      sessionStorage.clear();
      toast.info("You were logged out due to inactivity.");
      navigate("/", { replace: true });
    };

    const resetIdleTimer = () => {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(logoutUser, IDLE_TIMEOUT);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimerRef.current);
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer),
      );
    };
  }, [token, navigate]);

  const roleNotAllowed =
    allowedRoles.length > 0 && !allowedRoles.includes(role);

  let hasFeatureAccess = true;

  if (role === "user" && userdata) {
    const matchedRoute = matchRoute(location.pathname, USER_ROUTE_FEATURE_MAP);

    const requiredFeatures = matchedRoute
      ? USER_ROUTE_FEATURE_MAP[matchedRoute]
      : [];

    if (requiredFeatures.length > 0) {
      hasFeatureAccess = requiredFeatures.every(
        (feature) => userdata[feature] === true,
      );
    }
  }

  useEffect(() => {
    if (roleNotAllowed && !toastShownRef.current) {
      toast.error("You don’t have permission to access this page.");
      toastShownRef.current = true;
    }
  }, [roleNotAllowed]);

  useEffect(() => {
    if (!hasFeatureAccess && !toastShownRef.current) {
      toast.error("You don’t have permission to access this feature.");
      toastShownRef.current = true;
    }
  }, [hasFeatureAccess]);

  useEffect(() => {
    if (hasFeatureAccess) {
      sessionStorage.setItem(LAST_ALLOWED_ROUTE, location.pathname);
    }
  }, [hasFeatureAccess, location.pathname]);

  if (!token || !role) {
    return <Navigate to="/" replace />;
  }

  if (roleNotAllowed) {
    return <Navigate to="/no-access" replace />;
  }

  if (!hasFeatureAccess) {
    return <Navigate to="/no-access" replace />;
  }

  return children;
};

export default ProtectedRoute;
