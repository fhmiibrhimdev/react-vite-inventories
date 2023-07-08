import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";
import Select from "react-select";
import { debounce } from "lodash";
import Case from "../../components/Case";
import { useNavigate } from "react-router-dom";
import appConfig from "../../config/appConfig";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useState, useCallback } from "react";
import InputValidation from "../Layout/Components/InputValidation";
import Pagination from "../Layout/Components/Pagination";
import SearchEntries from "../Layout/Components/SearchEntries";

export default function StockCard() {
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRows, setTotalRows] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermDebounced, setSearchTermDebounced] = useState("");
    const [showing, setShowing] = useState(10);

    const [refetch, setRefetch] = useState(Math.random());
    const MySwal = withReactContent(Swal);

    useEffect(() => {
        document.title = "Inventories - Stock Card";
        axios
            .get(
                `${appConfig.baseurlAPI}/stock-card?item_id=${formData.item_id}&start_date=${formData.start_date}&end_date=${formData.end_date}&page=${currentPage}&per_page=${showing}&search=${searchTerm}&showing=${showing}`
            )
            .then((data) => {
                // console.log(data.data.data.data);
                setRows(data.data.data.data);
                setItems(data.data.items);
                setTotalPages(data.data.data.last_page);
                setTotalRows(data.data.data.total);
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.response.status === 403) {
                    navigate("/403");
                } else {
                    console.log(error);
                }
                setIsLoading(false);
            });
    }, [currentPage, showing, searchTermDebounced, refetch]);

    const firstDayOfMonth = moment()
        .startOf("month")
        .format("YYYY-MM-DD HH:mm");
    const endDayOfMonth = moment().endOf("month").format("YYYY-MM-DD HH:mm");

    /**
     * Initial form, reset input fields, and validate the form
     */

    const [formData, setFormData] = useState({
        item_id: "",
        start_date: firstDayOfMonth,
        end_date: endDayOfMonth,
    });

    const [formErrors, setFormErrors] = useState({
        item_id: "",
        start_date: "",
        end_date: "",
    });

    /**
     * Handle searching, pagination, and showing data
     */

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearchDebounced = useCallback(
        debounce((value) => {
            setSearchTermDebounced(value);
        }, appConfig.debounceTimeout),
        []
    );

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        handleSearchDebounced(value);
    };

    const handleShow = (event) => {
        setShowing(parseInt(event.target.value));
    };

    /**
     * Handle request
     */

    const handleSelectedChange = (value) => {
        setFormData({
            ...formData,
            item_id: value.value,
        });
        setRefetch(Math.random());
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
        setRefetch(Math.random());
    };

    if (isLoading) {
        return (
            <Case>
                <div className="section-header px-4 tw-rounded-none tw-shadow-md tw-shadow-gray-200 lg:tw-rounded-lg">
                    <h1 className="mb-1 tw-text-lg">Loading...</h1>
                </div>
            </Case>
        );
    }

    return (
        <Case>
            <div className="section-header px-4 tw-rounded-none tw-shadow-md tw-shadow-gray-200 lg:tw-rounded-lg">
                <h1 className="mb-1 tw-text-lg">Stock Card</h1>
            </div>

            <div className="section-body">
                <div className="tw-grid tw-grid-cols-1 tw-gap-0 lg:tw-grid-cols-4 lg:tw-gap-6">
                    <div>
                        <div className="card">
                            <div className="card-body">
                                <div className="form-group">
                                    <label htmlFor="item_id">Item name</label>
                                    <Select
                                        id="item_id"
                                        name="item_id"
                                        options={items}
                                        onChange={handleSelectedChange}
                                    />
                                    {formErrors.item_id && (
                                        <span className="tw-text-xs tw-text-red-500">
                                            {formErrors.item_id}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="px-4">
                                <InputValidation
                                    label="Start Date"
                                    name="start_date"
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    error={formErrors.start_date}
                                />
                                <InputValidation
                                    label="End Date"
                                    name="end_date"
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    error={formErrors.end_date}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="tw-col-span-3">
                        <div className="card">
                            <div className="card-body px-0">
                                <h3>Table Stock Card</h3>
                                <SearchEntries
                                    showing={showing}
                                    handleShow={handleShow}
                                    searchTerm={searchTerm}
                                    handleSearch={handleSearch}
                                />
                                <div className="table-responsive tw-max-h-96">
                                    <table>
                                        <thead className="tw-sticky tw-top-0">
                                            <tr className="tw-text-center tw-text-gray-700">
                                                <th rowSpan="2">Date</th>
                                                <th rowSpan="2">Description</th>
                                                <th rowSpan="2">First Stock</th>
                                                <th colSpan="2">Mutation</th>
                                                <th rowSpan="2">Last Stock</th>
                                            </tr>
                                            <tr className="tw-text-center tw-text-gray-700">
                                                <th>IN</th>
                                                <th>OUT</th>
                                            </tr>
                                        </thead>
                                        <tbody className="tw-text-center">
                                            {Array.isArray(rows) &&
                                            rows.length ? (
                                                rows.map((row, index) => (
                                                    <tr key={index}>
                                                        <td>{row.date}</td>
                                                        <td className="tw-text-left">
                                                            {row.description}
                                                        </td>
                                                        <td>
                                                            {row.status ===
                                                            "Balance" ? (
                                                                <>{row.qty}</>
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </td>
                                                        <td>
                                                            {row.status ===
                                                            "In" ? (
                                                                <>{row.qty}</>
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </td>
                                                        <td>
                                                            {row.status ===
                                                            "Out" ? (
                                                                <>{row.qty}</>
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </td>
                                                        <td>{row.balancing}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="6"
                                                        className="text-center"
                                                    >
                                                        Not data available in
                                                        the table
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination and showing data */}
                                <Pagination
                                    currentPage={currentPage}
                                    showing={showing}
                                    totalRows={totalRows}
                                    totalPages={totalPages}
                                    handlePageChange={handlePageChange}
                                />
                                {/* Pagination and showing data */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Case>
    );
}
