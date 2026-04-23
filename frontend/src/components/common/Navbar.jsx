import { useEffect, useMemo, useState } from "react";
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi2";
import { FaArrowRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, matchPath, useLocation } from "react-router-dom";

import learnWellLogo from "../../assets/Logo/Logo-Full-Light.png";
import { NavbarLinks } from "../../data/navbar-links.js";
import { apiConnector } from "../../services/apiconnector.js";
import { categories } from "../../services/apis.js";
import { ACCOUNT_TYPE } from "../../utils/constants.js";
import ProfileDropdown from "../core/Auth/ProfileDropDown.jsx";

const Navbar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [catalogItems, setCatalogItems] = useState([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const fetchCatalogItems = async () => {
      setIsCatalogLoading(true);

      try {
        const response = await apiConnector("GET", categories.CATEGORIES_API);
        setCatalogItems(
          Array.isArray(response?.data?.data) ? response.data.data : [],
        );
      } catch {
        setCatalogItems([]);
      } finally {
        setIsCatalogLoading(false);
      }
    };

    fetchCatalogItems();
  }, []);

  const hasActiveRoute = (routePath) =>
    matchPath({ path: routePath }, location.pathname);

  const featuredCategories = useMemo(
    () =>
      catalogItems
        .slice(0, 6),
    [catalogItems],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-richblack-900/80 backdrop-blur-xl">
      <div className="mx-auto flex w-11/12 max-w-maxContent items-center justify-between gap-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={learnWellLogo}
            alt="LearnWell"
            width={148}
            height={32}
            loading="lazy"
          />
          <span className="hidden rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-100 md:inline-flex md:items-center md:gap-1">
            <HiSparkles />
            Crafted by Rohit Yadav
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NavbarLinks.map((link) => (
            <div key={link.title} className="relative">
              {link.title === "Explore" ? (
                <div className="group relative flex cursor-pointer items-center gap-2 text-sm font-medium text-richblack-25">
                  <Link
                    to="/catalog/web-development"
                    className={
                      hasActiveRoute("/catalog/:catalogName")
                        ? "text-yellow-25"
                        : ""
                    }
                  >
                    {link.title}
                  </Link>
                  <BsChevronDown className="text-xs text-richblack-300 transition-transform duration-300 group-hover:rotate-180" />

                  <div className="invisible absolute left-1/2 top-full z-20 mt-5 grid w-[320px] -translate-x-1/2 gap-2 rounded-3xl border border-white/10 bg-richblack-800/95 p-4 opacity-0 shadow-2xl shadow-richblack-900/40 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-yellow-25">
                        Explore LearnWell
                      </p>
                      <p className="mt-2 text-sm font-semibold text-richblack-5">
                        Discover categories, browse learning paths, and jump into course pages from here.
                      </p>
                      <Link
                        to="/"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-yellow-25"
                      >
                        Go to home
                        <FaArrowRight className="text-xs" />
                      </Link>
                    </div>

                    <p className="px-2 text-xs uppercase tracking-[0.24em] text-richblack-300">
                      Learning paths
                    </p>

                    {isCatalogLoading ? (
                      <p className="px-2 py-4 text-sm text-richblack-300">
                        Loading categories…
                      </p>
                    ) : featuredCategories.length > 0 ? (
                      featuredCategories.map((category) => (
                        <Link
                          key={category._id}
                          to={`/catalog/${category.name.split(" ").join("-").toLowerCase()}`}
                          className="rounded-2xl border border-transparent px-4 py-3 transition hover:border-white/10 hover:bg-white/5"
                        >
                          <p className="font-semibold text-richblack-5">
                            {category.name}
                          </p>
                          <p className="mt-1 text-sm text-richblack-300">
                            {category?.description ||
                              "Fresh lessons and practical projects."}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-sm text-richblack-300">
                        Categories are not available yet. Students can still explore from [`Home`](frontend/src/data/navbar-links.js) and instructors can add courses from the dashboard.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  to={link.path}
                  className={`text-sm font-medium transition ${hasActiveRoute(link.path) ? "text-yellow-25" : "text-richblack-25 hover:text-richblack-5"}`}
                >
                  {link.title}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user && user.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link
              to="/dashboard/cart"
              className="relative rounded-full border border-white/10 p-2.5"
            >
              <AiOutlineShoppingCart className="text-xl text-richblack-25" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-yellow-50 text-[10px] font-bold text-richblack-900">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {token === null ? (
            <>
              <Link
                to="/login"
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-richblack-25 transition hover:border-white/20 hover:bg-white/5"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-gradient-to-r from-yellow-50 to-yellow-25 px-4 py-2 text-sm font-semibold text-richblack-900 shadow-lg shadow-yellow-50/20 transition hover:scale-[1.02]"
              >
                Start free
              </Link>
            </>
          ) : (
            <ProfileDropdown />
          )}
        </div>

        <button
          type="button"
          className="rounded-full border border-white/10 p-2 text-richblack-25 md:hidden"
          onClick={() => setShowMobileMenu((currentValue) => !currentValue)}
        >
          <AiOutlineMenu className="text-xl" />
        </button>
      </div>

      {showMobileMenu && (
        <div className="border-t border-white/10 bg-richblack-800/95 px-[4.5%] py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {NavbarLinks.map((link) => (
              <Link
                key={link.title}
                to={
                  link.title === "Explore"
                    ? "/catalog/web-development"
                    : link.path
                }
                className="text-sm font-medium text-richblack-25"
                onClick={() => setShowMobileMenu(false)}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
