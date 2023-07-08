import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";
import { debounce } from "lodash";
import Case from "../../components/Case";
import { useNavigate } from "react-router-dom";
import appConfig from "../../config/appConfig";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useState, useCallback } from "react";
import InputValidation from "../Layout/Components/InputValidation";
import TextareaValidation from "../Layout/Components/TextareaValidation";
import Pagination from "../Layout/Components/Pagination";
import AddButton from "../Layout/Components/AddButton";
import SearchEntries from "../Layout/Components/SearchEntries";
import ModalFooter from "../Layout/Components/ModalFooter";
import ModalHeader from "../Layout/Components/ModalHeader";

export default function StockIn() {
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
        document.title = "Inventories - Stock In";
        axios
            .get(
                `${appConfig.baseurlAPI}/stock-in?page=${currentPage}&per_page=${showing}&search=${searchTerm}&showing=${showing}`
            )
            .then((data) => {
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

    const [modalData, setModalData] = useState(null);
    const [isEditing, setIsEditing] = useState(null);

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 7);
    const formattedDate = currentDate.toISOString().slice(0, 16);

    /**
     * Initial form, reset input fields, and validate the form
     */

    const [formData, setFormData] = useState({
        date: formattedDate,
        item_id: "",
        qty: "1",
        description: "[In] ",
    });

    const initialFormData = {
        date: formattedDate,
        item_id: "",
        qty: "1",
        description: "[In] ",
    };

    const [formErrors, setFormErrors] = useState({
        item_id: "",
        qty: "",
        description: "",
    });

    const validateForm = () => {
        let errors = {};
        let formIsValid = true;

        // Validate input date
        if (!formData.date) {
            formIsValid = false;
            errors.date = "Date is required";
        }

        // Validate input item_id
        if (!formData.item_id) {
            formIsValid = false;
            errors.item_id = "Item name is required";
        }

        // Validate input qty
        if (!formData.qty) {
            formIsValid = false;
            errors.qty = "Qty is required";
        } else if (!/^\d+(\.\d{1,2})?$/.test(formData.qty)) {
            formIsValid = false;
            errors.qty = "Qty is invalid must be number";
        }

        // Validate input description
        if (!formData.description) {
            formIsValid = false;
            errors.description = "Description is required";
        }

        setFormErrors(errors);
        return formIsValid;
    };

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

    const handleAdd = () => {
        setModalData(null);
        setIsEditing(false);
        setFormData(initialFormData);
    };

    const handleEdit = (id) => {
        const data = rows.find((row) => row.id === id);
        setModalData(data);
        setFormData({
            date: data.date,
            item_id: data.item_id,
            qty: data.qty,
            description: data.description,
        });
        setIsEditing(true);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectedChange = (value) => {
        setFormData({
            ...formData,
            item_id: value.value,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!isEditing) {
            if (validateForm()) {
                axios
                    .post(`${appConfig.baseurlAPI}/stock-in`, formData, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                    .then((response) => {
                        if (response.status === 201) {
                            Swal.fire({
                                title: "Success!",
                                text: "Data created successfully",
                                icon: "success",
                                timer: 1500,
                            }).then(() => {
                                $(".modal").modal("hide");
                                setRefetch(Math.random()); // refetch new data
                                setFormData(initialFormData); // set initial value for input
                            });
                        } else {
                            throw new Error("Network response was not ok");
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                        MySwal.fire({
                            title: "Oops...",
                            html: "Something went wrong.",
                            icon: "error",
                            timer: 2000,
                        });
                    });
            }
        } else {
            if (validateForm()) {
                axios
                    .put(
                        `${appConfig.baseurlAPI}/stock-in/${modalData.id}`,
                        formData,
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    )
                    .then((response) => {
                        if (response.status === 200) {
                            Swal.fire({
                                title: "Success!",
                                text: "Data updated successfully",
                                icon: "success",
                                timer: 1500,
                            }).then(() => {
                                $(".modal").modal("hide");
                                setRefetch(Math.random()); // refetch new data
                                setFormData(initialFormData); // set initial value for input
                            });
                        } else {
                            throw new Error("Network response was not ok");
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                        MySwal.fire({
                            title: "Oops...",
                            html: "Something went wrong.",
                            icon: "error",
                            timer: 2000,
                        });
                    });
            }
        }
    };

    /**
     * Handle delete request
     */

    const handleConfirmationDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                handleDelete(id);
            }
        });
    };

    const handleDelete = (id) => {
        axios
            .delete(`${appConfig.baseurlAPI}/stock-in/${id}`)
            .then((data) => {
                setRows(rows.filter((row) => row.id !== id));
                setTotalRows(totalRows - 1);
                MySwal.fire({
                    title: "Successfully!",
                    html: "Data deleted succesfully.",
                    icon: "success",
                    timer: 1500,
                });
            })
            .catch((error) => {
                console.error("Error:", error);
                MySwal.fire({
                    title: "Oops...",
                    html: "Something went wrong.",
                    icon: "error",
                    timer: 2000,
                });
            });
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
                <h1 className="mb-1 tw-text-lg">Stock In</h1>
            </div>

            <div className="section-body">
                <div className="card">
                    <div className="card-body px-0">
                        <h3>Table Stock In</h3>
                        <SearchEntries
                            showing={showing}
                            handleShow={handleShow}
                            searchTerm={searchTerm}
                            handleSearch={handleSearch}
                        />
                        <div className="table-responsive tw-max-h-96">
                            <table>
                                <thead className="tw-sticky tw-top-0">
                                    <tr className="tw-text-gray-700">
                                        <th width="8%" className="text-center">
                                            No
                                        </th>
                                        <th width="18%">Date</th>
                                        <th width="20%">Item name</th>
                                        <th width="7%">Qty</th>
                                        <th width="30%">Description</th>
                                        <th className="text-center">
                                            <i className="fas fa-cog"></i>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(rows) && rows.length ? (
                                        rows.map((row, index) => (
                                            <tr key={index}>
                                                <td className="text-center">
                                                    {index + 1}
                                                </td>
                                                <td>{row.date}</td>
                                                <td>{row.item_name}</td>
                                                <td>{row.qty}</td>
                                                <td>{row.description}</td>
                                                <td className="text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(row.id)
                                                        }
                                                        className="btn btn-primary mr-2"
                                                        data-toggle="modal"
                                                        data-target="#formDataModal"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleConfirmationDelete(
                                                                row.id
                                                            )
                                                        }
                                                        className="btn btn-danger"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="text-center"
                                            >
                                                Not data available in the table
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
                <AddButton handleAdd={handleAdd} />
            </div>

            <div
                className="modal fade"
                id="formDataModal"
                aria-labelledby="formDataModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <ModalHeader isEditing={isEditing} />
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <InputValidation
                                    label="Date"
                                    name="date"
                                    type="datetime-local"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    error={formErrors.date}
                                />
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
                                <InputValidation
                                    label="Qty"
                                    name="qty"
                                    type="number"
                                    value={formData.qty}
                                    onChange={handleInputChange}
                                    error={formErrors.qty}
                                />
                                <TextareaValidation
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    error={formErrors.description}
                                />
                            </div>
                            <ModalFooter />
                        </form>
                    </div>
                </div>
            </div>
        </Case>
    );
}
