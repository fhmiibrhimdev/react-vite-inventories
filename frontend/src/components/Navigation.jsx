import axios from "axios";
import NavLink from "./NavLink";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getTokenWithExpiration } from "../pages/Auth/Session";
import appConfig from "../config/appConfig";

export default function Navigation() {
    const [user, setUser] = useState({});

    const navigate = useNavigate();
    const token = getTokenWithExpiration("token");

    const dropdownRef1 = useRef(null);
    const dropdownRef2 = useRef(null);
    const dropdownRef3 = useRef(null);
    const [dropdownOpen1, setDropdownOpen1] = useState(false);
    const [dropdownOpen2, setDropdownOpen2] = useState(false);
    const [dropdownOpen3, setDropdownOpen3] = useState(false);

    const handleDropdownClick = (dropdown) => {
        if (dropdown === 1) {
            setDropdownOpen1(!dropdownOpen1);
        } else if (dropdown === 2) {
            setDropdownOpen2(!dropdownOpen2);
        } else if (dropdown === 3) {
            setDropdownOpen3(!dropdownOpen3);
        }
    };

    const handleClickOutsideDropdown = (event) => {
        if (
            dropdownRef1.current &&
            !dropdownRef1.current.contains(event.target) &&
            dropdownRef2.current &&
            !dropdownRef2.current.contains(event.target) &&
            dropdownRef3.current &&
            !dropdownRef3.current.contains(event.target)
        ) {
            setDropdownOpen1(false);
            setDropdownOpen2(false);
            setDropdownOpen3(false);
        }
    };

    useEffect(() => {
        document.title = "Dashboard";
        if (!token) {
            navigate("/");
        }
        fetchData();

        document.addEventListener("mousedown", handleClickOutsideDropdown);
        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutsideDropdown
            );
        };
    }, [navigate]);

    const fetchData = async () => {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await axios.get(`${appConfig.baseurlAPI}/user`).then((response) => {
            setUser(response.data);
        });
    };

    const logoutHandler = async () => {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await axios.post(`${appConfig.baseurlAPI}/logout`).then(() => {
            localStorage.removeItem("token");
            navigate("/");
        });
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg main-navbar">
                <Link to="/" className="navbar-brand sidebar-gone-hide">
                    MINVENTORY
                </Link>
                <div className="navbar-nav">
                    <a
                        href="#"
                        className="nav-link sidebar-gone-show"
                        data-toggle="sidebar"
                    >
                        <i className="fas fa-bars"></i>
                    </a>
                </div>
                <form className="form-inline ml-auto"></form>
                <ul className="navbar-nav navbar-right">
                    <li className="dropdown">
                        <a
                            href="#"
                            data-toggle="dropdown"
                            className="nav-link dropdown-toggle nav-link-lg nav-link-user"
                        >
                            <div className="d-sm-none d-lg-inline-block">
                                Hi, {user.name}
                            </div>
                        </a>
                        <div className="dropdown-menu dropdown-menu-right">
                            <div className="dropdown-title">
                                ROLE: {user.role}
                            </div>
                            <Link
                                to="/profile"
                                className="dropdown-item has-icon"
                            >
                                <i className="far fa-user"></i> Profile
                            </Link>
                            <div className="dropdown-divider"></div>
                            <a
                                onClick={logoutHandler}
                                href="#"
                                className="dropdown-item has-icon text-danger"
                            >
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </div>
                    </li>
                </ul>
            </nav>
            <nav className="navbar navbar-secondary navbar-expand-lg">
                <div className="container">
                    <ul className="navbar-nav">
                        <li
                            className={`nav-item ${
                                location.pathname === "/dashboard"
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <NavLink href="/dashboard">
                                <i className="far fa-home"></i>
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        <li
                            className={`nav-item dropdown ${
                                location.pathname === "/category" ||
                                location.pathname === "/rack-location" ||
                                location.pathname === "/items"
                                    ? "active"
                                    : ""
                            }`}
                            ref={dropdownRef1}
                        >
                            <a
                                href="#"
                                onClick={() => handleDropdownClick(1)}
                                className={`nav-link has-dropdown ${
                                    dropdownOpen1 ? "show" : ""
                                }`}
                            >
                                <i className="fas fa-fire"></i>
                                <span>Master Data</span>
                            </a>
                            <ul
                                className={`dropdown-menu ${
                                    dropdownOpen1 ? "show" : ""
                                }`}
                            >
                                <li
                                    className={`nav-item ${
                                        location.pathname === "/category"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <NavLink href="/category">Category</NavLink>
                                </li>
                                <li
                                    className={`nav-item ${
                                        location.pathname === "/rack-location"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <NavLink href="/rack-location">
                                        Rack Location
                                    </NavLink>
                                </li>
                                <li
                                    className={`nav-item ${
                                        location.pathname === "/items"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <NavLink href="/items">Items</NavLink>
                                </li>
                            </ul>
                        </li>
                        <li
                            className={`nav-item dropdown ${
                                location.pathname ===
                                    "/opening-balance-items" ||
                                location.pathname === "/stock-in" ||
                                location.pathname === "/stock-out" ||
                                location.pathname === "/stock-opname"
                                    ? "active"
                                    : ""
                            }`}
                            ref={dropdownRef2}
                        >
                            <a
                                href="#"
                                onClick={() => handleDropdownClick(2)}
                                className={`nav-link has-dropdown ${
                                    dropdownOpen2 ? "show" : ""
                                }`}
                            >
                                <i className="fas fa-inventory"></i>
                                <span>Inventory</span>
                            </a>
                            <ul
                                className={`dropdown-menu ${
                                    dropdownOpen2 ? "show" : ""
                                }`}
                            >
                                <li
                                    className={`nav-item ${
                                        location.pathname ===
                                        "/opening-balance-items"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <NavLink href="/opening-balance-items">
                                        Opening Balance Items
                                    </NavLink>
                                </li>
                                <li
                                    className={`nav-item ${
                                        location.pathname === "/stock-in"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <NavLink href="/stock-in">Stock In</NavLink>
                                </li>
                                <li
                                    className={`nav-item ${
                                        location.pathname === "/stock-out"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <NavLink href="/stock-out">
                                        Stock Out
                                    </NavLink>
                                </li>
                                <li
                                    className={`nav-item ${
                                        location.pathname === "/stock-opname"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <NavLink href="/stock-opname">
                                        Stock Opname
                                    </NavLink>
                                </li>
                            </ul>
                        </li>
                        <li
                            className={`nav-item ${
                                location.pathname === "/stock-card"
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <NavLink href="/stock-card">
                                <i className="far fa-pallet"></i>
                                <span>Stock Card</span>
                            </NavLink>
                        </li>
                        <li
                            className={`nav-item dropdown ${
                                location.pathname ===
                                    "/report-opening-balance-items" ||
                                location.pathname === "/report-stock-in" ||
                                location.pathname === "/report-stock-out" ||
                                location.pathname === "/report-stock-opname"
                                    ? "active"
                                    : ""
                            }`}
                            ref={dropdownRef3}
                        >
                            <a
                                href="#"
                                onClick={() => handleDropdownClick(3)}
                                className={`nav-link has-dropdown ${
                                    dropdownOpen3 ? "show" : ""
                                }`}
                            >
                                <i className="far fa-file-archive"></i>
                                <span>Report</span>
                            </a>
                            <ul
                                className={`dropdown-menu ${
                                    dropdownOpen3 ? "show" : ""
                                }`}
                            >
                                <li
                                    className={`nav-item ${
                                        location.pathname ===
                                        "/report-opening-balance-items"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <NavLink href="/report-opening-balance-items">
                                        Opening Balance Items
                                    </NavLink>
                                </li>
                                <li
                                    className={`nav-item ${
                                        location.pathname === "/report-stock-in"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <NavLink href="/report-stock-in">
                                        Stock In
                                    </NavLink>
                                </li>
                                <li
                                    className={`nav-item ${
                                        location.pathname ===
                                        "/report-stock-out"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <NavLink href="/report-stock-out">
                                        Stock Out
                                    </NavLink>
                                </li>
                                <li
                                    className={`nav-item ${
                                        location.pathname ===
                                        "/report-stock-opname"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <NavLink href="/report-stock-opname">
                                        Stock Opname
                                    </NavLink>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
}
